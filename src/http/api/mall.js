import { get, post, cPostForYun } from "../http";
import { mergeWordAndTimeStamp, timeStamp } from "../../common/js/utils";
import store from "../../store";

//获取页面权限
export const GetRolePermissions = (param) =>
  post(
    `${
      store.state.config.url
    }/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions")
    )}&time=${timeStamp()}`,
    param
  );

//获取楼栋列表
export const GetBuildingList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Building/GetList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Building/GetList")
    )}&time=${timeStamp()}`,
    param
  );

//添加楼栋
export const AddBuilding = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Building/Add?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Building/Add")
    )}&time=${timeStamp()}`,
    param
  );

//添加楼栋
export const EditBuilding = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Building/Edit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Building/Edit")
    )}&time=${timeStamp()}`,
    param
  );

//删除楼栋
export const DelBuilding = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Building/Del?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Building/Del")
    )}&time=${timeStamp()}`,
    param
  );

//获取楼层列表
export const GetFloorList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Floor/GetFloorList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Floor/GetFloorList")
    )}&time=${timeStamp()}`,
    param
  );

//添加楼层
export const AddFloor = (param) =>
  post(
    `${store.state.config.mallYunUrl}/API/Floor/Add?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Floor/Add")
    )}&time=${timeStamp()}`,
    param
  );

//编辑楼层
export const FloorEdit = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Floor/FloorEdit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Floor/FloorEdit")
    )}&time=${timeStamp()}`,
    param
  );

//删除楼层
export const FloorDel = (param) =>
  post(
    `${store.state.config.mallYunUrl}/api/Floor/Del?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/api/Floor/Del")
    )}&time=${timeStamp()}`,
    param
  );

//楼层排序
export const FloorOrderEdit = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Floor/OrderEdit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Floor/OrderEdit")
    )}&time=${timeStamp()}`,
    param
  );

//获取业态列表
export const GetShopFormatList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/ShopFormat/GetShopFormatList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/ShopFormat/GetShopFormatList")
    )}&time=${timeStamp()}`,
    param
  );

//添加业态
export const ShopFormatAdd = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/ShopFormat/ShopFormatAdd?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/ShopFormat/ShopFormatAdd")
    )}&time=${timeStamp()}`,
    param
  );

//获取业态详情
export const GetShopFormatInfo = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/ShopFormat/GetShopFormatInfo?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/ShopFormat/GetShopFormatInfo")
    )}&time=${timeStamp()}`,
    param
  );

//修改业态
export const EditFormat = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/ShopFormat/SFEdit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/ShopFormat/SFEdit")
    )}&time=${timeStamp()}`,
    param
  );

//修改业态
export const ShopFormatDel = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/ShopFormat/ShopFormatDel?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/ShopFormat/ShopFormatDel")
    )}&time=${timeStamp()}`,
    param
  );

//获取品牌数据列表
export const PageShopList = cPostForYun("/API/Shop/PageShopList");

//添加品牌数据
export const ShopAdd = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ShopAdd?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ShopAdd")
    )}&time=${timeStamp()}`,
    param
  );

//获取品牌详情
export const GetShopInfo = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/GetShopInfo?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/GetShopInfo")
    )}&time=${timeStamp()}`,
    param
  );

//编辑品牌
export const ShopEdit = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ShopEdit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ShopEdit")
    )}&time=${timeStamp()}`,
    param
  );

//删除品牌
export const ShopDel = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ShopDel?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ShopDel")
    )}&time=${timeStamp()}`,
    param
  );

//修改启用状态
export const ChangeShopStatus = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ChangeShopStatus?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ChangeShopStatus")
    )}&time=${timeStamp()}`,
    param
  );

//获取店铺列表
export const QueryShopList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/QueryShopList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/QueryShopList")
    )}&time=${timeStamp()}`,
    param
  );

//获取写字楼列表
export const PageOfficeList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/PageOfficeList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/PageOfficeList")
    )}&time=${timeStamp()}`,
    param
  );

//添加写字楼公司
export const OfficeAdd = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/OfficeAdd?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/OfficeAdd")
    )}&time=${timeStamp()}`,
    param
  );

//获取写字楼公司详情
export const GetOfficeInfo = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/GetOfficeInfo?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/GetOfficeInfo")
    )}&time=${timeStamp()}`,
    param
  );

//编辑写字楼公司
export const OfficeEdit = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/OfficeEdit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/OfficeEdit")
    )}&time=${timeStamp()}`,
    param
  );

//删除写字楼公司
export const OfficeDel = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/OfficeDel?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/OfficeDel")
    )}&time=${timeStamp()}`,
    param
  );

//修改写字楼状态
export const ChangeOfficeStatus = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Office/ChangeOfficeStatus?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Office/ChangeOfficeStatus")
    )}&time=${timeStamp()}`,
    param
  );

//同步店铺数据
export const GetSynData = (param) =>
  post(
    `${store.state.config.url}/api/cdn/GetSynData?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/api/cdn/GetSynData")
    )}&time=${timeStamp()}`,
    param
  );

//获取标签数据
export const GetShopLabelList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/api/LabelToObject/GetShopLabelList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/api/LabelToObject/GetShopLabelList")
    )}&time=${timeStamp()}`,
    param
  );

//设置标签数据
export const SetLabel = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/api/LabelToObject/Set?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/api/LabelToObject/Set")
    )}&time=${timeStamp()}`,
    param
  );

//获取区域列表
export const GetRegionList = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Area/GetList?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Area/GetList")
    )}&time=${timeStamp()}`,
    param
  );

//添加区域
export const AddRegion = (param) =>
  post(
    `${store.state.config.mallYunUrl}/API/Area/Add?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Area/Add")
    )}&time=${timeStamp()}`,
    param
  );

//编辑区域
export const EditRegion = (param) =>
  post(
    `${store.state.config.mallYunUrl}/API/Area/Edit?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Area/Edit")
    )}&time=${timeStamp()}`,
    param
  );

//删除区域
export const DelRegion = (param) =>
  post(
    `${store.state.config.mallYunUrl}/API/Area/Del?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Area/Del")
    )}&time=${timeStamp()}`,
    param
  );

//导出店铺模板
export const ExportTemplate = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ExportTemplate?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ExportTemplate")
    )}&time=${timeStamp()}`,
    param
  );

//导入店铺模板
export const ImportShopData = (param) =>
  post(
    `${
      store.state.config.mallYunUrl
    }/API/Shop/ImportShopData?token=${encodeURIComponent(
      mergeWordAndTimeStamp("/API/Shop/ImportShopData")
    )}&time=${timeStamp()}`,
    param
  );

//获取设施列表
export const GetFacilityList = cPostForYun("/api/Facility/GetList");

//获取设施类型列表
export const GetFacilitiesTypeList = cPostForYun(
  "/api/Facility/GetFacilitiesTypeList"
);

//获取商场设施类型名列表
export const GetMallFacilityList = cPostForYun(
  "/api/Facility/GetMallFacilityList"
);

//添加设施
export const AddFacility = cPostForYun("/api/Facility/Add");

//修改设施
export const EditFacility = cPostForYun("/api/Facility/Edit");

//删除设施
export const DelFacility = cPostForYun("/api/Facility/Del");
