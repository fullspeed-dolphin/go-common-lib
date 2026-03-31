# 跑团活动报名自动入团 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户报名跑团活动后，若未归属任何跑团，自动将其加入该活动所属的跑团，并在报名成功弹窗中展示入团信息。

**Architecture:** 在 booking-api 的 `CreateRegistration` 方法中，报名成功后查询用户的 `running_group` 字段，若为空则直接操作共享数据库（`rg_memberships`、`user_info`、`running_groups`）完成入团。自动入团为 best-effort 操作，失败不影响报名成功。前端根据响应中的 `auto_joined_group` 字段展示居中弹窗。

**Tech Stack:** Go (Gin + database/sql), Vue 3 (uni-app), MySQL

---

## File Structure

### booking-api (后端)

| File | Action | Responsibility |
|------|--------|----------------|
| `internal/repository/fsc_event_registration.go` | Modify | `FscEventInfo` 增加 `FscID` 字段，`GetEventInfo` SQL 增加 `fsc_id` |
| `internal/repository/running_group.go` | **Create** | 跑团表和成员表的数据访问：查询跑团信息、创建成员、递增人数 |
| `internal/repository/user.go` | Modify | 新增 `UpdateRunningGroup` 方法 |
| `internal/service/fsc_event_registration.go` | Modify | 新增 `autoJoinGroup` 方法，`CreateRegistration` 中调用，构造函数增加依赖 |
| `cmd/server/main.go` | Modify | 传入新增的 repository 依赖 |

### ccrun (前端)

| File | Action | Responsibility |
|------|--------|----------------|
| `uni-running/pagesSub/runningTeam/teamEventDetail.vue` | Modify | 处理 `auto_joined_group` 响应，展示入团成功弹窗 |

---

### Task 1: 扩展 FscEventInfo 以包含 fsc_id

**Files:**
- Modify: `booking-api/internal/repository/fsc_event_registration.go:29-34` (FscEventInfo struct)
- Modify: `booking-api/internal/repository/fsc_event_registration.go:47-60` (GetEventInfo query)

- [ ] **Step 1: 修改 FscEventInfo 结构体，增加 FscID 字段**

```go
// FscEventInfo 活动基本信息（用于报名校验）
type FscEventInfo struct {
	ID               string
	FscID            int
	Status           string
	Capacity         *int
	RegistrationTime *string
}
```

- [ ] **Step 2: 修改 GetEventInfo SQL，查询 fsc_id**

```go
func (r *FscEventRegistrationRepository) GetEventInfo(eventID string) (*FscEventInfo, error) {
	var info FscEventInfo
	err := r.db.QueryRow(
		`SELECT id, fsc_id, status, capacity, registration_time FROM fsc_events WHERE id = ?`,
		eventID,
	).Scan(&info.ID, &info.FscID, &info.Status, &info.Capacity, &info.RegistrationTime)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("查询活动信息失败: %w", err)
	}
	return &info, nil
}
```

- [ ] **Step 3: 修改 validateEventForRegistration 返回 FscEventInfo**

在 `service/fsc_event_registration.go` 中，将 `validateEventForRegistration` 的签名从 `error` 改为 `(*repository.FscEventInfo, error)`：

```go
func (s *FscEventRegistrationService) validateEventForRegistration(eventID string) (*repository.FscEventInfo, error) {
	info, err := s.repo.GetEventInfo(eventID)
	if err != nil {
		return nil, fmt.Errorf("查询活动信息失败")
	}
	if info == nil {
		return nil, fmt.Errorf("活动不存在")
	}
	if info.Status != "ACT" {
		return nil, fmt.Errorf("活动未开放报名（当前状态: %s）", info.Status)
	}

	// 检查报名人数是否已满
	if info.Capacity != nil && *info.Capacity > 0 {
		count, _ := s.repo.CountByEventID(eventID)
		if count >= int64(*info.Capacity) {
			return nil, fmt.Errorf("报名人数已满")
		}
	}

	// 检查报名时间窗口
	if info.RegistrationTime != nil && *info.RegistrationTime != "" {
		var timeRange []string
		if err := json.Unmarshal([]byte(*info.RegistrationTime), &timeRange); err == nil && len(timeRange) >= 2 {
			now := time.Now()
			start, err1 := time.Parse(time.RFC3339, timeRange[0])
			end, err2 := time.Parse(time.RFC3339, timeRange[1])
			if err1 == nil && err2 == nil {
				if now.Before(start) {
					return nil, fmt.Errorf("报名尚未开始")
				}
				if now.After(end) {
					return nil, fmt.Errorf("报名已截止")
				}
			}
		}
	}

	return info, nil
}
```

- [ ] **Step 4: 更新 CreateRegistration 中对 validateEventForRegistration 的调用**

```go
// 校验活动状态、容量和报名时间
eventInfo, err := s.validateEventForRegistration(req.EventID)
if err != nil {
	return nil, err
}
```

`eventInfo` 将在后续 Task 4 中被传递给 `autoJoinGroup`。

- [ ] **Step 5: 编译验证**

Run: `cd /Users/zhangweilong/sourceCode/booking-api && go build ./...`
Expected: 编译通过，无错误

- [ ] **Step 6: Commit**

```bash
cd /Users/zhangweilong/sourceCode/booking-api
git add internal/repository/fsc_event_registration.go internal/service/fsc_event_registration.go
git commit -m "refactor: validateEventForRegistration 返回 FscEventInfo 以便后续获取 fsc_id"
```

---

### Task 2: 创建 running_group repository

**Files:**
- Create: `booking-api/internal/repository/running_group.go`

- [ ] **Step 1: 创建 running_group.go 文件**

```go
package repository

import (
	"database/sql"
	"fmt"
)

// RunningGroupBasicInfo 跑团基本信息
type RunningGroupBasicInfo struct {
	GroupID   int64
	Name      string
	AvatarURL string
	Status    string
}

// RunningGroupRepository 跑团数据访问层
type RunningGroupRepository struct {
	db *sql.DB
}

// NewRunningGroupRepository 创建 Repository
func NewRunningGroupRepository(db *sql.DB) *RunningGroupRepository {
	return &RunningGroupRepository{db: db}
}

// GetBasicInfo 获取跑团基本信息（用于自动入团）
func (r *RunningGroupRepository) GetBasicInfo(tx *sql.Tx, groupID int) (*RunningGroupBasicInfo, error) {
	var info RunningGroupBasicInfo
	err := tx.QueryRow(
		`SELECT group_id, name, avatar_url, status FROM running_groups WHERE group_id = ? FOR UPDATE`,
		groupID,
	).Scan(&info.GroupID, &info.Name, &info.AvatarURL, &info.Status)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("查询跑团信息失败: %w", err)
	}
	return &info, nil
}

// MembershipExists 检查用户是否已是该跑团成员
func (r *RunningGroupRepository) MembershipExists(tx *sql.Tx, openID string, groupID int) (bool, error) {
	var count int
	err := tx.QueryRow(
		`SELECT COUNT(*) FROM rg_memberships WHERE openid = ? AND group_id = ?`,
		openID, groupID,
	).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("查询成员关系失败: %w", err)
	}
	return count > 0, nil
}

// CreateMembership 创建跑团成员记录
func (r *RunningGroupRepository) CreateMembership(tx *sql.Tx, openID, phone string, groupID int) error {
	_, err := tx.Exec(
		`INSERT INTO rg_memberships (openid, user_phone, group_id, role) VALUES (?, ?, ?, 'member')`,
		openID, phone, groupID,
	)
	if err != nil {
		return fmt.Errorf("创建成员记录失败: %w", err)
	}
	return nil
}

// IncrementMemberCount 递增跑团成员数
func (r *RunningGroupRepository) IncrementMemberCount(tx *sql.Tx, groupID int) error {
	_, err := tx.Exec(
		`UPDATE running_groups SET total_members = total_members + 1 WHERE group_id = ?`,
		groupID,
	)
	if err != nil {
		return fmt.Errorf("更新成员计数失败: %w", err)
	}
	return nil
}
```

- [ ] **Step 2: 编译验证**

Run: `cd /Users/zhangweilong/sourceCode/booking-api && go build ./...`
Expected: 编译通过

- [ ] **Step 3: Commit**

```bash
cd /Users/zhangweilong/sourceCode/booking-api
git add internal/repository/running_group.go
git commit -m "feat: 新增 RunningGroupRepository 支持自动入团数据操作"
```

---

### Task 3: UserRepository 新增 UpdateRunningGroup

**Files:**
- Modify: `booking-api/internal/repository/user.go`

- [ ] **Step 1: 添加 UpdateRunningGroup 方法**

在 `user.go` 文件末尾追加：

```go
// UpdateRunningGroup 更新用户的跑团归属
func (r *UserRepository) UpdateRunningGroup(tx *sql.Tx, openID string, groupID int) error {
	_, err := tx.Exec(
		"UPDATE user_info SET running_group = ? WHERE openid = ?",
		groupID, openID,
	)
	if err != nil {
		return fmt.Errorf("更新用户跑团失败: %w", err)
	}
	return nil
}

// GetRunningGroupTx 在事务中获取用户的跑团（带行锁）
func (r *UserRepository) GetRunningGroupTx(tx *sql.Tx, openID string) (*int64, error) {
	var runningGroup sql.NullInt64
	err := tx.QueryRow(
		"SELECT running_group FROM user_info WHERE openid = ? FOR UPDATE",
		openID,
	).Scan(&runningGroup)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("查询用户跑团失败: %w", err)
	}

	if runningGroup.Valid {
		return &runningGroup.Int64, nil
	}
	return nil, nil
}
```

- [ ] **Step 2: 编译验证**

Run: `cd /Users/zhangweilong/sourceCode/booking-api && go build ./...`
Expected: 编译通过

- [ ] **Step 3: Commit**

```bash
cd /Users/zhangweilong/sourceCode/booking-api
git add internal/repository/user.go
git commit -m "feat: UserRepository 新增事务内跑团读写方法"
```

---

### Task 4: 实现自动入团逻辑

**Files:**
- Modify: `booking-api/internal/service/fsc_event_registration.go`

- [ ] **Step 1: 扩展 FscCreateRegistrationResult，增加 AutoJoinedGroup**

将 service 文件中的结构体定义修改为：

```go
// AutoJoinedGroupInfo 自动加入的跑团信息
type AutoJoinedGroupInfo struct {
	GroupID   int64  `json:"group_id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

// FscCreateRegistrationResult 报名结果
type FscCreateRegistrationResult struct {
	RegNo           string               `json:"reg_no"`
	Status          string               `json:"status"`
	AutoJoinedGroup *AutoJoinedGroupInfo  `json:"auto_joined_group,omitempty"`
}
```

- [ ] **Step 2: 修改 FscEventRegistrationService 结构体和构造函数，注入新依赖**

```go
type FscEventRegistrationService struct {
	db       *sql.DB
	repo     *repository.FscEventRegistrationRepository
	userRepo *repository.UserRepository
	rgRepo   *repository.RunningGroupRepository
	logger   *zap.Logger
}

func NewFscEventRegistrationService(
	db *sql.DB,
	repo *repository.FscEventRegistrationRepository,
	userRepo *repository.UserRepository,
	rgRepo *repository.RunningGroupRepository,
	logger *zap.Logger,
) *FscEventRegistrationService {
	return &FscEventRegistrationService{db: db, repo: repo, userRepo: userRepo, rgRepo: rgRepo, logger: logger}
}
```

- [ ] **Step 3: 实现 autoJoinGroup 方法**

在 `validateEventForRegistration` 方法之后添加：

```go
// autoJoinGroup 自动加入跑团（best-effort，失败不影响报名）
func (s *FscEventRegistrationService) autoJoinGroup(userID string, fscID int) *AutoJoinedGroupInfo {
	tx, err := s.db.Begin()
	if err != nil {
		s.logger.Warn("auto join group: failed to begin tx", zap.Error(err))
		return nil
	}
	defer tx.Rollback()

	// 1. 检查用户是否已有跑团（带行锁防并发）
	rg, err := s.userRepo.GetRunningGroupTx(tx, userID)
	if err != nil {
		s.logger.Warn("auto join group: failed to get user running_group", zap.Error(err))
		return nil
	}
	if rg != nil && *rg > 0 {
		return nil // 已有跑团，跳过
	}

	// 2. 获取跑团信息（带行锁）
	groupInfo, err := s.rgRepo.GetBasicInfo(tx, fscID)
	if err != nil || groupInfo == nil {
		s.logger.Warn("auto join group: group not found or error", zap.Int("fsc_id", fscID), zap.Error(err))
		return nil
	}
	if groupInfo.Status != "ACT" {
		return nil // 跑团非活跃状态
	}

	// 3. 检查是否已是成员（防重复插入）
	exists, err := s.rgRepo.MembershipExists(tx, userID, fscID)
	if err != nil {
		s.logger.Warn("auto join group: failed to check membership", zap.Error(err))
		return nil
	}
	if exists {
		return nil
	}

	// 4. 获取用户手机号
	_, phone, err := s.userRepo.GetUserInfo(userID)
	if err != nil || phone == "" {
		s.logger.Warn("auto join group: failed to get user phone", zap.Error(err))
		return nil
	}

	// 5. 创建成员记录
	if err := s.rgRepo.CreateMembership(tx, userID, phone, fscID); err != nil {
		s.logger.Warn("auto join group: failed to create membership", zap.Error(err))
		return nil
	}

	// 6. 递增成员数
	if err := s.rgRepo.IncrementMemberCount(tx, fscID); err != nil {
		s.logger.Warn("auto join group: failed to increment member count", zap.Error(err))
		return nil
	}

	// 7. 更新用户跑团归属
	if err := s.userRepo.UpdateRunningGroup(tx, userID, fscID); err != nil {
		s.logger.Warn("auto join group: failed to update user running_group", zap.Error(err))
		return nil
	}

	if err := tx.Commit(); err != nil {
		s.logger.Warn("auto join group: failed to commit tx", zap.Error(err))
		return nil
	}

	s.logger.Info("auto join group: user auto joined group",
		zap.String("user_id", userID),
		zap.Int("group_id", fscID),
		zap.String("group_name", groupInfo.Name))

	return &AutoJoinedGroupInfo{
		GroupID:   groupInfo.GroupID,
		Name:      groupInfo.Name,
		AvatarURL: groupInfo.AvatarURL,
	}
}
```

- [ ] **Step 4: 在 CreateRegistration 中调用 autoJoinGroup**

修改 `CreateRegistration` 方法，在报名成功后调用自动入团。两处返回点（重新激活 & 新建报名）都需要处理：

```go
func (s *FscEventRegistrationService) CreateRegistration(req *types.FscEventRegistrationRequest, userID string) (*FscCreateRegistrationResult, error) {
	// 校验活动状态、容量和报名时间
	eventInfo, err := s.validateEventForRegistration(req.EventID)
	if err != nil {
		return nil, err
	}

	// 检查是否已报名
	existing, err := s.repo.GetByEventAndUser(req.EventID, userID)
	if err != nil {
		return nil, fmt.Errorf("检查报名状态失败: %w", err)
	}

	// 已报名且有效
	if existing != nil && existing.Status == "SUCC" {
		return nil, fmt.Errorf("你已报名该活动")
	}

	// 已取消，重新激活
	if existing != nil && existing.Status == "CXL" {
		if err := s.repo.Reactivate(req.EventID, userID, req.RealName, req.ContactNumber, req.CertType, req.CertNumber, req.Remark); err != nil {
			return nil, err
		}
		s.logger.Info("fsc event registration reactivated",
			zap.String("reg_no", existing.RegNo),
			zap.String("event_id", req.EventID))

		result := &FscCreateRegistrationResult{RegNo: existing.RegNo, Status: "SUCC"}
		result.AutoJoinedGroup = s.autoJoinGroup(userID, eventInfo.FscID)
		return result, nil
	}

	// 证件校验
	if req.CertType != nil && *req.CertType != "" && req.CertNumber != nil && *req.CertNumber != "" {
		if err := util.ValidateCertNumber(*req.CertType, *req.CertNumber); err != nil {
			return nil, fmt.Errorf("证件格式错误: %w", err)
		}
	}

	// 新建报名
	reg := &repository.FscEventRegistration{
		EventID:       req.EventID,
		UserID:        userID,
		RealName:      req.RealName,
		ContactNumber: req.ContactNumber,
		CertType:      req.CertType,
		CertNumber:    req.CertNumber,
		Remark:        req.Remark,
	}
	if err := s.repo.Create(reg); err != nil {
		return nil, err
	}

	s.logger.Info("fsc event registration created",
		zap.String("reg_no", reg.RegNo),
		zap.String("event_id", req.EventID))

	result := &FscCreateRegistrationResult{RegNo: reg.RegNo, Status: "SUCC"}
	result.AutoJoinedGroup = s.autoJoinGroup(userID, eventInfo.FscID)
	return result, nil
}
```

- [ ] **Step 5: 编译验证**

Run: `cd /Users/zhangweilong/sourceCode/booking-api && go build ./...`
Expected: 编译失败 — `NewFscEventRegistrationService` 签名变了，`main.go` 调用需要更新（Task 5 处理）

- [ ] **Step 6: Commit（在 Task 5 之后一起 commit，因为当前编译不过）**

本步暂不 commit，等 Task 5 完成后一起提交。

---

### Task 5: 更新 main.go 依赖注入

**Files:**
- Modify: `booking-api/cmd/server/main.go:82` (新增 repo 初始化)
- Modify: `booking-api/cmd/server/main.go:90` (修改 service 构造调用)

- [ ] **Step 1: 在 Repository 初始化块中新增 RunningGroupRepository**

在 `fscEventRegRepo` 之后添加一行：

```go
rgRepo := repository.NewRunningGroupRepository(db)
```

- [ ] **Step 2: 修改 fscEventRegService 构造调用，传入新依赖**

```go
fscEventRegService := service.NewFscEventRegistrationService(db, fscEventRegRepo, userRepo, rgRepo, logger)
```

- [ ] **Step 3: 编译验证**

Run: `cd /Users/zhangweilong/sourceCode/booking-api && go build ./...`
Expected: 编译通过，无错误

- [ ] **Step 4: Commit（包含 Task 4 和 Task 5 的改动）**

```bash
cd /Users/zhangweilong/sourceCode/booking-api
git add internal/service/fsc_event_registration.go cmd/server/main.go
git commit -m "feat: 跑团活动报名成功后自动加入跑团

报名成功时检测用户是否已归属跑团，若无则自动加入活动所属跑团。
自动入团为 best-effort 操作，失败不影响报名结果。
响应新增 auto_joined_group 字段返回入团信息。"
```

---

### Task 6: 前端 — 报名成功弹窗展示入团信息

**Files:**
- Modify: `ccrun/uni-running/pagesSub/runningTeam/teamEventDetail.vue`

- [ ] **Step 1: 新增弹窗状态变量**

在 `const memberList = ref([]);` 之后添加：

```javascript
const showJoinGroupModal = ref(false);
const joinedGroupInfo = ref(null);
```

- [ ] **Step 2: 修改 submitRegistration 处理响应**

替换 `submitRegistration` 函数：

```javascript
const submitRegistration = () => {
  uni.showLoading({ mask: true, title: '报名中...' });
  request.post('/booking-api/fsc_events/registration', {
    event_id: routerParams.value.id,
  }).then((res) => {
    uni.hideLoading();
    isRegistered.value = true;
    getRegistrationList();
    if (res.auto_joined_group) {
      joinedGroupInfo.value = res.auto_joined_group;
      showJoinGroupModal.value = true;
      store.dispatch("getUserInfo");
    } else {
      uni.$u.toast('报名成功');
    }
  }).catch((e) => {
    uni.hideLoading();
    const msg = e.msg || e.message || '报名失败';
    uni.$u.toast(msg);
  });
};
```

- [ ] **Step 3: 修改 submitRegistrationWithCert 处理响应**

替换 `.then` 回调部分：

```javascript
  }).then((res) => {
    uni.hideLoading();
    showCertPopup.value = false;
    isRegistered.value = true;
    getRegistrationList();
    if (res.auto_joined_group) {
      joinedGroupInfo.value = res.auto_joined_group;
      showJoinGroupModal.value = true;
      store.dispatch("getUserInfo");
    } else {
      uni.$u.toast('报名成功');
    }
  }).catch((e) => {
```

- [ ] **Step 4: 在模板中添加入团成功弹窗**

在 `<PhoneLogin ref="refPhoneLogin" />` 之前添加弹窗组件：

```html
    <!-- 自动入团成功弹窗 -->
    <u-popup :show="showJoinGroupModal" mode="center" round="16" :closeOnClickOverlay="false">
      <view class="join-group-modal">
        <view class="join-group-icon">
          <u-icon name="checkmark-circle-fill" color="#22C55E" size="48"></u-icon>
        </view>
        <text class="join-group-title">报名成功</text>
        <view class="join-group-info" v-if="joinedGroupInfo">
          <image
            class="join-group-avatar"
            :src="joinedGroupInfo.avatar_url ? joinedGroupInfo.avatar_url + '?x-oss-process=image/resize,w_120,h_120,m_fill' : '/static/images/user.png'"
            mode="aspectFill"
          />
          <text class="join-group-text">已自动加入跑团</text>
          <text class="join-group-name">{{ joinedGroupInfo.name }}</text>
        </view>
        <view class="join-group-btn" @click="showJoinGroupModal = false">
          <text class="join-group-btn-text">我知道了</text>
        </view>
      </view>
    </u-popup>
```

- [ ] **Step 5: 添加弹窗样式**

在 `<style>` 块末尾、`</style>` 标签之前添加：

```scss
.join-group-modal {
  width: 560rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.join-group-icon {
  margin-bottom: 8rpx;
}

.join-group-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.join-group-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin: 16rpx 0;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  width: 100%;
}

.join-group-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.join-group-text {
  font-size: 26rpx;
  color: #9CA3AF;
}

.join-group-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.join-group-btn {
  width: 100%;
  height: 80rpx;
  background: #FF8C00;
  border-radius: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}

.join-group-btn-text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
}
```

- [ ] **Step 6: 验证前端编译**

Run: `cd /Users/zhangweilong/sourceCode/ccrun && npx uni build --platform mp-weixin 2>&1 | tail -5`
Expected: 编译成功

- [ ] **Step 7: Commit**

```bash
cd /Users/zhangweilong/sourceCode/ccrun
git add uni-running/pagesSub/runningTeam/teamEventDetail.vue
git commit -m "feat: 跑团活动报名成功后展示自动入团弹窗

报名成功时若后端返回 auto_joined_group，展示居中弹窗显示跑团头像和名称。
同时刷新 Vuex 中的用户信息以同步跑团归属状态。"
```
