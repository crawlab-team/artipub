import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Form, Input, Modal, Popconfirm, Table} from "antd";
import {Platform, PlatformModelState} from "@/models/platform";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {ColumnProps} from "antd/lib/table";
import style from './PlatformList.scss'

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';
import constants from "@/constants";

export interface PlatformListProps extends ConnectProps {
  platform: PlatformModelState;
  dispatch: Dispatch;
}

const PlatformList: React.FC<PlatformListProps> = props => {
  const {dispatch, platform} = props;

  const onEdit: Function = (d: Platform) => {
    return () => {
      dispatch({
        type: 'platform/saveCurrentPlatform',
        payload: d,
      });
      dispatch({
        type: 'platform/saveModalVisible',
        payload: true,
      });
    }
  };

  const onAdd = () => {
    dispatch({
      type: 'platform/saveCurrentPlatform',
      payload: {
        name: '',
        label: '',
        description: '',
      }
    });
    dispatch({
      type: 'platform/saveModalVisible',
      payload: true,
    });
  };

  const onDelete: Function = (d: Platform) => {
    return async () => {
      if (dispatch) {
        await dispatch({
          type: 'platform/deletePlatform',
          payload: d
        });
        await dispatch({
          type: 'platform/fetchPlatformList',
        });
      }
    }
  };

  const onFieldChange: Function = (fieldName: string) => {
    return (ev: any) => {
      const currentPlatform = platform.currentPlatform;
      if (currentPlatform) {
        currentPlatform[fieldName] = ev.target.value;
        dispatch({
          type: 'platform/saveCurrentPlatform',
          payload: currentPlatform,
        });
      }
    }
  };

  const onModalCancel = () => {
    dispatch({
      type: 'platform/saveModalVisible',
      payload: false,
    })
  };

  const onSave = async () => {
    if (platform.currentPlatform) {
      if (platform.currentPlatform._id) {
        // 更改
        await dispatch({
          type: 'platform/savePlatform',
          payload: platform.currentPlatform,
        });
      } else {
        // 新增
        await dispatch({
          type: 'platform/addPlatform',
          payload: platform.currentPlatform,
        });
      }
      await dispatch({
        type: 'platform/fetchPlatformList',
      });
      await dispatch({
        type: 'platform/saveModalVisible',
        payload: false,
      });
    }
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '图标',
      width: '80px',
      dataIndex: '_id',
      key: '_id',
      render: (text: string, d: Platform) => {
        if (d.name === constants.platform.JUEJIN) {
          return <img className={style.siteLogo} src={imgJuejin}/>
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          return <img className={style.siteLogo} src={imgSegmentfault}/>
        } else if (d.name === constants.platform.JIANSHU) {
          return <img className={style.siteLogo} src={imgJianshu}/>
        } else {
          return <span>Logo</span>
        }
      }
    },
    {
      title: '平台代号',
      dataIndex: 'name',
      key: 'name',
      width: '180px',
    },
    {
      title: '平台名称',
      dataIndex: 'label',
      key: 'label',
      width: '180px',
    },
    {
      title: '平台描述',
      dataIndex: 'description',
      key: 'description',
      width: '400px',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, d) => {
        return (
          <div>
            <Button type="default" shape="circle" icon="edit" className={style.editBtn} onClick={onEdit(d)}/>
            <Popconfirm title="您确认删除该平台吗？" onConfirm={onDelete(d)}>
              <Button type="danger" shape="circle" icon="delete" className={style.delBtn}/>
            </Popconfirm>
          </div>
        )
      }
    }
  ];

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }
  }, []);

  return (
    <PageHeaderWrapper>
      <Modal title={(platform.currentPlatform && platform.currentPlatform._id) ? '更改平台' : '新增平台'}
             visible={platform.modalVisible}
             onOk={onSave}
             onCancel={onModalCancel}>
        <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
          <Form.Item label="代号">
            <Input value={platform.currentPlatform ? platform.currentPlatform.name : ''}
                   onChange={onFieldChange('name')}/>
          </Form.Item>
          <Form.Item label="名称">
            <Input value={platform.currentPlatform ? platform.currentPlatform.label : ''}
                   onChange={onFieldChange('label')}/>
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea value={platform.currentPlatform ? platform.currentPlatform.description : ''}
                            onChange={onFieldChange('description')}/>
          </Form.Item>
        </Form>
      </Modal>
      <div className={style.actions}>
        <Button className={style.addBtn} type="primary" onClick={onAdd}>添加平台</Button>
      </div>
      <Table dataSource={platform.platforms} columns={columns}/>
    </PageHeaderWrapper>
  );
};

export default connect(({platform}: ConnectState) => ({
  platform
}))(PlatformList);
