import { get, post } from '../http'
import { timeStamp, mergeWordAndTimeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//获取部门管理列表
export const getDeptList = (param) =>
	post(`${store.state.config.url}/api/Dept/GetList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dept/GetList"))}&time=${timeStamp()}`,param)

//添加部门
export const addDept = (param) =>
	post(`${store.state.config.url}/api/Dept/add?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dept/add"))}&time=${timeStamp()}`,param)

//修改部门
export const editDept = (param) =>
	post(`${store.state.config.url}/api/Dept/edit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dept/edit"))}&time=${timeStamp()}`,param)

//删除部门
export const delDept = (param) =>
	post(`${store.state.config.url}/api/Dept/del?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dept/del"))}&time=${timeStamp()}`,param)

//获取设备列表
export const GetDeviceList = (param) =>
	post(`${store.state.config.url}/api/DeptDevice/GetDeviceList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DeptDevice/GetDeviceList"))}&time=${timeStamp()}`,param)

//分配设备
export const UpdateGroupInfo = (param) =>
	post(`${store.state.config.url}/api/DeptDevice/UpdateGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DeptDevice/UpdateGroupInfo"))}&time=${timeStamp()}`,param)

//角色列表
export const getRolesList = (param) =>
	post(`${store.state.config.url}/api/roles/GetList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/roles/GetList"))}&time=${timeStamp()}`,param)

//获取权限树
export const GetMenuActionTree = (param) =>
	post(`${store.state.config.url}/api/Permission/GetMenuActionTree?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Permission/GetMenuActionTree"))}&time=${timeStamp()}`,param)

//获取已获得权限
export const GetPermissionsList = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetPermissionsList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetPermissionsList"))}&time=${timeStamp()}`,param)

//添加角色
export const addRoles = (param) =>
	post(`${store.state.config.url}/api/roles/add?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/roles/add"))}&time=${timeStamp()}`,param)

//修改角色
export const editRoles = (param) =>
	post(`${store.state.config.url}/api/roles/edit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/roles/edit"))}&time=${timeStamp()}`,param)

//删除角色
export const delRoles = (param) =>
	post(`${store.state.config.url}/api/roles/del?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/roles/del"))}&time=${timeStamp()}`,param)

//获取用户列表
export const GetUserList = (param) =>
	post(`${store.state.config.url}/api/Account/GetUserList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/GetUserList"))}&time=${timeStamp()}`,param)

//添加用户
export const addUser = (param) =>
	post(`${store.state.config.url}/api/Account/add?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/add"))}&time=${timeStamp()}`,param)

//编辑用户
export const editUser = (param) =>
	post(`${store.state.config.url}/api/Account/edit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/edit"))}&time=${timeStamp()}`,param)

//删除用户
export const delUser = (param) =>
	post(`${store.state.config.url}/api/Account/del?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/del"))}&time=${timeStamp()}`,param)

//获取角色列表
export const GetUserRolesList = (param) =>
	post(`${store.state.config.url}/api/roles/GetRolesList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/roles/GetRolesList"))}&time=${timeStamp()}`,param)

//锁定角色
export const UnLockUser = (param) =>
	post(`${store.state.config.url}/api/Account/UnLockUser?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/UnLockUser"))}&time=${timeStamp()}`,param)

//邮件报警
export const SetWarningUser = (param) =>
	post(`${store.state.config.url}/api/Account/SetWarningUser?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/SetWarningUser"))}&time=${timeStamp()}`,param)

//修改密码
export const ChangePassWord = (param) =>
	post(`${store.state.config.url}/api/Account/ChangePassWord?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/ChangePassWord"))}&time=${timeStamp()}`,param)

//获取云开关控制
export const GetMallModuleList = (param) =>
	post(`${store.state.config.yunUrl}/api/Modules/GetMallModuleList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Modules/GetMallModuleList"))}&time=${timeStamp()}`,param)

//获取本地开关控制
export const GetModuleList = (param) =>
	post(`${store.state.config.url}/api/Modules/GetModuleList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Modules/GetModuleList"))}&time=${timeStamp()}`,param)

//获取时间轴
export const getTimeAxis = (param) =>
	post(`${store.state.config.mallYunUrl}/api/TimeAxis/GetInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/TimeAxis/GetInfo"))}&time=${timeStamp()}`,param)

//获取素材到期提醒
export const GetProgramMonitor = (param) =>
	post(`${store.state.config.url}/api/Setting/GetProgramMonitor?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Setting/GetProgramMonitor"))}&time=${timeStamp()}`,param)

//获取素材到期提醒
export const SettingProgramMonitor = (param) =>
	post(`${store.state.config.url}/api/Setting/SettingProgramMonitor?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Setting/SettingProgramMonitor"))}&time=${timeStamp()}`,param)

//设置时间段
export const SetTimeAxis = (param) =>
	post(`${store.state.config.mallYunUrl}/api/TimeAxis/SetTimeAxis?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/TimeAxis/SetTimeAxis"))}&time=${timeStamp()}`,param)

//设置时间段开放商家
export const setTimeRelate = (param) =>
	post(`${store.state.config.mallYunUrl}/api/TimeAxis/setTimeRelate?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/TimeAxis/setTimeRelate"))}&time=${timeStamp()}`,param)

//设置系统功能开关
export const ModulesSet = (param) =>
	post(`${store.state.config.url}/api/Modules/ModulesSet?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Modules/ModulesSet"))}&time=${timeStamp()}`,param)

//获取屏保设置
export const GetScreensaver = (param) =>
	post(`${store.state.config.url}/api/Screensaver/GetScreensaver?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Screensaver/GetScreensaver"))}&time=${timeStamp()}`,param)

//屏保设置
export const SetScreensaver = (param) =>
	post(`${store.state.config.url}/api/Screensaver/SetScreensaver?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Screensaver/SetScreensaver"))}&time=${timeStamp()}`,param)

//获取日志
export const QueryLogPageList = (param) =>
	post(`${store.state.config.url}/api/LOG/QueryLogPageList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/LOG/QueryLogPageList"))}&time=${timeStamp()}`,param)

//获取密码配置
export const GetConfig = (param) =>
	post(`${store.state.config.url}/api/PwdConfig/GetConfig?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/PwdConfig/GetConfig"))}&time=${timeStamp()}`,param)

//更新密码配置
export const UpdateConfig = (param) =>
	post(`${store.state.config.url}/api/PwdConfig/UpdateConfig?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/PwdConfig/UpdateConfig"))}&time=${timeStamp()}`,param)

//获取分辨率列表
export const ResolutionList = (param) =>
    post(`${store.state.config.url}/api/Screensaver/ResolutionList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Screensaver/ResolutionList"))}&time=${timeStamp()}`,param)

//设置分辨率默认图片
export const SetResolution = (param) =>
    post(`${store.state.config.url}/api/Screensaver/SetResolution?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Screensaver/SetResolution"))}&time=${timeStamp()}`,param)

//获取审核权限
export const ProgramAuditSetting = (param) =>
    post(`${store.state.config.url}/api/Setting/ProgramAuditSetting?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Setting/ProgramAuditSetting"))}&time=${timeStamp()}`,param)

//设置审核开关
export const SetProgramAudit = (param) =>
    post(`${store.state.config.url}/api/Setting/SetProgramAudit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Setting/SetProgramAudit"))}&time=${timeStamp()}`,param)
