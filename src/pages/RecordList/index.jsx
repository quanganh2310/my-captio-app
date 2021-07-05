import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Input, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import TranscriptDesc from './components/TranscriptDesc.jsx';
import { queryRecord, updateRecord, addRecord, removeRecord } from './service';
import './index.css';
/**
 * 添加节点
 *
 * @param fields
 */

const handleAdd = async (fields) => {
  const hide = message.loading('Saving');

  try {
    await addRecord({ ...fields });
    hide();
    message.success('Saved record!');
    return true;
  } catch (error) {
    hide();
    message.error('Save failed！');
    return false;
  }
};
/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields) => {
  const hide = message.loading('Updating record');

  try {
    await updateRecord({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();
    message.success('Record updated');
    return true;
  } catch (error) {
    hide();
    message.error('Update failed！');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows) => {
  const hide = message.loading('Deleting');
  if (!selectedRows) return true;

  try {
    await removeRecord({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted record');
    return true;
  } catch (error) {
    hide();
    message.error('Deleted failed');
    return false;
  }
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
}

const RecordList = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState(false);
  /** 分布更新窗口的弹窗 */

  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef();
  const [currentRow, setCurrentRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  /** 国际化配置 */

  const currentUser = getCurrentUser().userName;

  const intl = useIntl();
  const columns = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.recordName.nameLabel"
          defaultMessage="Record Name"
        />
      ),
      dataIndex: 'name',
      // tip: 'Saved record name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="Description" />,
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleLength" defaultMessage="Length" />,
    //   dataIndex: 'length',
    //   // sorter: true,
    //   hideInForm: true,
    //   // renderText: (val) =>
    //   //   `${val}${intl.formatMessage({
    //   //     id: 'pages.searchTable.tenThousand',
    //   //     defaultMessage: ' 万 ',
    //   //   })}`,
    // },
    {
      title: <FormattedMessage id="pages.searchTable.titleType" defaultMessage="Type" />,
      dataIndex: 'type',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.application" defaultMessage="application" />
          ),
          // status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.microphone" defaultMessage="microphone" />
          ),
          // status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.file" defaultMessage="file" />
          ),
          // status: 'Success',
        },
        // 3: {
        //   text: (
        //     <FormattedMessage id="pages.searchTable.nameStatus.abnormal" defaultMessage="异常" />
        //   ),
        //   status: 'Error',
        // },
      },
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.titleCreatedAt" defaultMessage="Created at" />
      ),
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      // renderFormItem: (item, { defaultRender, ...rest }, form) => {
      //   const status = form.getFieldValue('status');

      //   if (`${status}` === '0') {
      //     return false;
      //   }

      //   if (`${status}` === '3') {
      //     return (
      //       <Input
      //         {...rest}
      //         placeholder={intl.formatMessage({
      //           id: 'pages.searchTable.exception',
      //           defaultMessage: '请输入异常原因！',
      //         })}
      //       />
      //     );
      //   }

      //   return defaultRender(item);
      // },
    },
    // {
    //   title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   render: (_, record) => [
    //     <a
    //       key="config"
    //       onClick={() => {
    //         handleUpdateModalVisible(true);
    //         setCurrentRow(record);
    //       }}
    //     >
    //       <FormattedMessage id="pages.searchTable.config" defaultMessage="配置" />
    //     </a>,
    //     // <a key="subscribeAlert" href="https://procomponents.ant.design/">
    //     //   <FormattedMessage id="pages.searchTable.subscribeAlert" defaultMessage="订阅警报" />
    //     // </a>,
    //   ],
    // },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: '查询表格',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          // <Button
          //   type="primary"
          //   key="primary"
          //   onClick={() => {
          //     handleModalVisible(true);
          //   }}
          // >
          //   <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          // </Button>,
        ]}
        request={(params, sorter, filter) => queryRecord({ ...params, sorter, filter, currentUser })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="服务调用次数总计"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.batchApproval" defaultMessage="批量审批" />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRecord',
          defaultMessage: '新建规则',
        })}
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          console.log(value);
          if (success) {
            handleModalVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          records={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.recordName"
                  defaultMessage="规则名称为必填项"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={1200}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
        placement="right"
      >
        {currentRow?.name && (
          <>
            <TranscriptDesc
              messages={currentRow.transcriptData}
              name={currentRow.name}
              createdAt={currentRow.createdAt}
              audioSource={currentRow.audioData}
              type={currentRow.type}
            />
          </>
          // <ProDescriptions
          //   column={2}
          //   title={currentRow?.name}
          //   request={async () => ({
          //     data: currentRow || {},
          //   })}
          //   params={{
          //     id: currentRow?.name,
          //   }}
          //   columns={columns}
          // />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RecordList;
