import { get, post } from '../http'
import {mergeWordAndTimeStamp, timeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//我的应用列表
export const GetMallAppList = (param) =>
	post(`${store.state.config.url}/api/AppManager/GetMallAppList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/AppManager/GetMallAppList"))}&time=${timeStamp()}`,param)

//我的应用列表
export const GetAppDevList = (param) =>
	post(`${store.state.config.url}/api/AppManager/GetAppDevList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/AppManager/GetAppDevList"))}&time=${timeStamp()}`,param)

//发布应用
export const PublishApp = (param) =>
	post(`${store.state.config.url}/api/AppManager/Publish?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/AppManager/Publish"))}&time=${timeStamp()}`,param)

//获取时间轴设备列表
export const GetAppDev = (param) =>
	post(`${store.state.config.url}/api/dev/GetAppDev?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/GetAppDev"))}&time=${timeStamp()}`,param)

//获取时间轴列表
export const GetTimeInfo = (param) =>
	post(`${store.state.config.mallYunUrl}/api/TimeAxis/GetInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/TimeAxis/GetInfo"))}&time=${timeStamp()}`,param)

//获取时间轴应用详情
export const GetAppListByDev = (param) =>
	post(`${store.state.config.url}/api/dev/GetAppListByDev?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/GetAppListByDev"))}&time=${timeStamp()}`,param)

//设置应用时间轴
export const SetDev = (param) =>
	post(`${store.state.config.url}/api/dev/Set?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/Set"))}&time=${timeStamp()}`,param)
