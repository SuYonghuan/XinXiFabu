import { cPost } from '../../http/http'

export class MaterialApi {
    static get = cPost(`/Api/Material/MaterialList`);
    static post = cPost(`/Api/Material/AddLocalMaterial`);
    static postDynamic = cPost(`/Api/Material/AddDynamicMaterial`);
    static put = cPost(`/Api/Material/EditMaterial`);
    static delete = cPost('/Api/Material/Del');
    static getAuditList = cPost('/Api/Material/AuditMaterialList');
    static getProgList = cPost('/Api/Material/MaterialProgList');
    static deleteMatProgRel = cPost('/Api/Material/MaterialProgDel')
    static audit = cPost('/Api/Material/AuditMaterials');
    static async getMaterialTypes() {
        if (MaterialApi.materialTypes) return MaterialApi.materialTypes
        const { data } = await cPost(`/Api/Programme/ProgramDataDict`)({ name: "MaterialType" })
        MaterialApi.materialTypes = data
        return data;
    };
    static async getAuditTypes() {
        if (MaterialApi.auditType) return MaterialApi.auditType
        const { data } = await cPost(`/Api/Programme/ProgramDataDict`)({ name: "MaterialAuditType" })
        MaterialApi.auditType = data
        return data;
    };
}

export class ProgramApi {
    static get = cPost(`/Api/Programme/ProgrammeList`);
    static getDetail = cPost(`/Api/Programme/ProgrammeInfo`);
    static post = cPost(`/Api/Programme/AddProgramme`);
    static put = cPost('/Api/Programme/EditProgramme')
    static delete = cPost('/Api/Programme/Del');
    static getResolutions = cPost('/Api/Programme/ResolutionList');
    static async getComponentTypes() {
        if (ProgramApi.componentTypes) return ProgramApi.componentTypes
        const { data } = await cPost(`/Api/Programme/ProgramDataDict`)({ name: "ComponentType" })
        ProgramApi.componentTypes = data
        return data;
    };
    static getMaterials = cPost('/Api/Programme/ComponentMaterials');
}

export class ScheduleApi {
    static get = cPost("/Api/Schedule/ScheduleList");
    static getPublishedList = cPost("/Api/Schedule/PublishedList");
    static getScheduleDevices = cPost('/Api/Schedule/PublishedDevList')
    static post = cPost("/Api/Schedule/AddSchedule");
    static put = cPost("/Api/Schedule/EditSchedule");
    static delete = cPost('/Api/Schedule/Del');
    static unpublish = cPost('/Api/Schedule/UnPublishSchedule');
    static getDetail = cPost(`/Api/Schedule/ScheduleInfo`);
    static getAuditDetail = cPost(`/Api/Schedule/AuditScheduleInfo`);
    static getAuditList = cPost('/Api/Schedule/AuditScheduleList');
    static getAuditedList = cPost('/Api/Schedule/AuditedList')
    static getDeviceList = cPost('/Api/Schedule/DeviceList')
    static audit = cPost('/Api/Schedule/AuditSchedule');
    static publish = cPost('/Api/Schedule/PublishSchedule');
    static async getIntervalTypes() {
        if (ScheduleApi.intervalTypes) return ScheduleApi.intervalTypes
        const { data } = await cPost(`/Api/Programme/ProgramDataDict`)({ name: "IntervalType" })
        ScheduleApi.intervalTypes = data
        return data;
    };
    static async getPlayModes() {
        if (ScheduleApi.playMode) return ScheduleApi.playMode
        const { data } = await cPost(`/Api/Programme/ProgramDataDict`)({ name: "PlayMode" })
        ScheduleApi.playMode = data
        return data;
    };
    static getPrograms = cPost('/Api/Schedule/ProgrammeList');
}