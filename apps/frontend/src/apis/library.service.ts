import request from "@/utils/request";
const apiUrl = import.meta.env.VITE_API_URL_Library;

// 主题库相关接口
export const libraryApis = {
  // 获取所有主题库列表
  getLibraryList: (params: object = {}) => {
    return request({
      url: `${apiUrl}/business/api/theme/queryViewList`,
      method: "get",
      params,
    });
  },

  // 获取部门所有主题库列表
  getDeptLibraryList: (deptNo: number) => {
    return request({
      url: `${apiUrl}/business/api/themeDept/queryDepartmentTheme`,
      method: "get",
      params: {
        deptNo,
      },
    });
  },

  // 获取主题库字段
  getLibraryColumns: (tableName: string) => {
    return request({
      url: `${apiUrl}/business/api/theme/getViewFields`,
      method: "get",
      params: {
        tableName,
      },
    });
  },

  // 获取主题库数据
  getLibraryColumnsData: (tableName: string) => {
    return request({
      url: `${apiUrl}/business/api/theme/queryBasicData`,
      method: "get",
      params: {
        tableName,
      },
    });
  },

  // 获取系统主题统计
  getViewStatistics: (params: object) => {
    return request({
      url: `${apiUrl}/business/api/statistics/findStatistics`,
      method: "get",
      params,
    });
  },
};

// 个人主题库相关接口
export const libraryApisPersonal = {
  // 创建个人主题库
  create: (data: object) => {
    return request({
      url: `${apiUrl}/business/api/theme/add`,
      method: "post",
      data,
    });
  },

  // 更新个人主题库
  update: (data: object) => {
    return request({
      url: `${apiUrl}/business/api/theme/edit`,
      method: "post",
      data,
    });
  },

  // 删除个人主题库
  delete: (id: number) => {
    return request({
      url: `${apiUrl}/business/api/theme/delete`,
      method: "post",
      data: {
        id,
      },
    });
  },

  // 获取个人主题库列表
  getListByPage: (params: object) => {
    return request({
      url: `${apiUrl}/business/api/theme/findPage`,
      method: "get",
      params,
    });
  },

  // 获取个人主题库详情
  getDetail: (id: number) => {
    return request({
      url: `${apiUrl}/business/api/theme/findDetail`,
      method: "get",
      params: {
        id,
      },
    });
  },

  // 获取个人主题库预览列表
  getPreviewListByPage: (params: object) => {
    return request({
      url: `${apiUrl}/business/api/buildAView/generated`,
      method: "get",
      params,
    });
  },

  // 导出主题库预览数据
  exportPreviewData: (id: string, remarks: string = "") => {
    return request({
      url: `${apiUrl}/business/api/buildAView/export`,
      method: "post",
      data: {
        id,
        remarks,
      },
    });
  },

  // 获取导出记录
  getExportRecords: (subThemeId: string) => {
    return request({
      url: `${apiUrl}/business/api/themeExportList/findList`,
      method: "get",
      params: {
        subThemeId,
      },
    });
  },
};
