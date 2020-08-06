import { get, post } from '../http'
import { timeStamp, mergeWordAndTimeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//获取终端设备列表
export const GetDeviceList = (param) =>
	post(`${store.state.config.url}/api/Dev/GetDeviceList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetDeviceList"))}&time=${timeStamp()}`,param)

//设备重启
export const DeviceCommandReStart = (param) =>
	post(`${store.state.config.url}/api/Dev/DeviceCommandReStart?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DeviceCommandReStart"))}&time=${timeStamp()}`,param)

//设备关机
export const DeviceCommandShutDown = (param) =>
	post(`${store.state.config.url}/api/Dev/DeviceCommandShutDown?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DeviceCommandShutDown"))}&time=${timeStamp()}`,param)

//设置关机时间
export const DeviceSetShutDownTime = (param) =>
	post(`${store.state.config.url}/api/Dev/DeviceSetShutDownTime?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DeviceSetShutDownTime"))}&time=${timeStamp()}`,param)

//设置关机时间
export const DeviceScreenshot = (param) =>
	post(`${store.state.config.url}/api/dev/DeviceScreenshot?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/DeviceScreenshot"))}&time=${timeStamp()}`,param)

//清除关机时间
export const DeviceCleanShutDownTime = (param) =>
	post(`${store.state.config.url}/api/Dev/DeviceCleanShutDownTime?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DeviceCleanShutDownTime"))}&time=${timeStamp()}`,param)

//设置同屏状态
export const SetSynStatus = (param) =>
	post(`${store.state.config.url}/api/dev/SetSynStatus?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/SetSynStatus"))}&time=${timeStamp()}`,param)

//设置触摸状态
export const ScreenOper = (param) =>
	post(`${store.state.config.url}/api/dev/ScreenOper?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/ScreenOper"))}&time=${timeStamp()}`,param)

//获取楼栋列表
export const GetDeviceOptionsNew = (param) =>
	post(`${store.state.config.url}/api/Dev/GetDeviceOptionsNew?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetDeviceOptionsNew"))}&time=${timeStamp()}`,param)

//删除设备
export const DelDevices = (param) =>
	post(`${store.state.config.url}/api/Dev/DelDevices?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DelDevices"))}&time=${timeStamp()}`,param)

//导出设备节目
export const ExportDevProgs = (param) =>
	post(`${store.state.config.url}/api/dev/ExportDevProgs?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/ExportDevProgs"))}&time=${timeStamp()}`,param)

//获取设备详情
export const GetDeviceInfo = (param) =>
	post(`${store.state.config.url}/api/Dev/GetDeviceInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetDeviceInfo"))}&time=${timeStamp()}`,param)

//获取节目列表
export const GetLocalProgram = (param) =>
	post(`${store.state.config.url}/api/Dev/GetLocalProgram?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetLocalProgram"))}&time=${timeStamp()}`,param)

//获取管理部门列表
export const GetDeptListByDeviceCode = (param) =>
	post(`${store.state.config.url}/api/DeptDevice/GetDeptListByDeviceCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DeptDevice/GetDeptListByDeviceCode"))}&time=${timeStamp()}`,param)

//修改设备名
export const DevNumEdit = (param) =>
	post(`${store.state.config.url}/api/Dev/DevNumEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/DevNumEdit"))}&time=${timeStamp()}`,param)

//修改设备备注
export const RemarksEdit = (param) =>
	post(`${store.state.config.url}/api/Dev/RemarksEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/RemarksEdit"))}&time=${timeStamp()}`,param)

//获取终端组列表
export const GetDevGroupList = (param) =>
	post(`${store.state.config.url}/api/DevGroup/GetDevGroupList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/GetDevGroupList"))}&time=${timeStamp()}`,param)

//获取设备列表
export const GetDeviceByGroupCode = (param) =>
	post(`${store.state.config.url}/api/dev/GetDeviceByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/GetDeviceByGroupCode"))}&time=${timeStamp()}`,param)

//添加设备组
export const AddDeviceGroup = (param) =>
	post(`${store.state.config.url}/api/DevGroup/AddDeviceGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/AddDeviceGroup"))}&time=${timeStamp()}`,param)

//获取设备组详情
export const GetGroupInfo = (param) =>
	post(`${store.state.config.url}/api/DevGroup/GetGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/GetGroupInfo"))}&time=${timeStamp()}`,param)

//修改设备组
export const UpdateGroupInfo = (param) =>
	post(`${store.state.config.url}/api/DevGroup/UpdateGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/UpdateGroupInfo"))}&time=${timeStamp()}`,param)

//删除设备组
export const DelDeviceGroup = (param) =>
	post(`${store.state.config.url}/api/DevGroup/DelDeviceGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/DelDeviceGroup"))}&time=${timeStamp()}`,param)

//获取设备组设备数量
export const GetDeviceListByGroupCode = (param) =>
	post(`${store.state.config.url}/api/Dev/GetDeviceListByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetDeviceListByGroupCode"))}&time=${timeStamp()}`,param)

//获取设备组节目
export const GetProgramGroupByDeviceGroup = (param) =>
	post(`${store.state.config.url}/api/DevGroup/GetProgramGroupByDeviceGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/GetProgramGroupByDeviceGroup"))}&time=${timeStamp()}`,param)

//删除设备组节目
export const DelProgramDevice = (param) =>
	post(`${store.state.config.url}/api/DevGroup/DelProgramDevice?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/DelProgramDevice"))}&time=${timeStamp()}`,param)

