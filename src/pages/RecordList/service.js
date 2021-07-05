import request from '@/utils/request';

export async function getAllRecords(params) {
  return request('/api/allRecords', {
    params,
  });
}

export async function queryRecord(params) {
  return request('/api/records', {
    params,
  });
}
export async function removeRecord(params) {
  return request('/api/records', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addRecord(params) {
  return request('/api/records', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRecord(params) {
  return request('/api/records', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}
