import { cPost } from '../../http/http'

export class MaterialApi {
    static get = cPost(`/Api/Material/MaterialList`);
    static post = cPost(`/Api/Material/AddLocalMaterial`);
    static postDynamic = cPost(`/Api/Material/AddDynamicMaterial`);
    static put = cPost(`/Api/Material/EditMaterial`);
    static delete = cPost('/Api/Material/Del');
    static getAuditList = cPost('/Api/Material/AuditMaterialList');
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
    static post = cPost(`/Api/Programme/AddProgramme`);
    static delete = cPost('/Api/Programme/Del');
    static getResolutions = cPost('/Api/Programme/ResolutionList');
}
