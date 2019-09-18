import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Card, message, Select, Table} from 'antd';
import {ConnectProps, ConnectState, Dispatch} from '@/models/connect';
import {connect} from 'dva';
import {ColumnProps} from 'antd/lib/table';
import {Environment, EnvironmentModelState} from "@/models/environment";
import constants from '../../constants';

export interface EnvironmentListProps extends ConnectProps {
  environment: EnvironmentModelState;
  dispatch: Dispatch;
}

const EnvironmentList: React.FC<EnvironmentListProps> = props => {
  const {dispatch, environment} = props;

  const getValue = (d: Environment) => {
    if (d._id === constants.environment.UPDATE_STATS_CRON) {
      return (
        <Select
          value={d.value}
          style={{width: '200px'}}
          onChange={onFieldChange(d)}
        >
          <Select.Option value="0 0/5 * * * *">每5分钟</Select.Option>
          <Select.Option value="0 0/10 * * * *">每10分钟</Select.Option>
          <Select.Option value="0 0/30 * * * *">每30分钟</Select.Option>
          <Select.Option value="0 0 * * * *">每1小时</Select.Option>
          <Select.Option value="0 0 0/6 * * *">每6小时</Select.Option>
          <Select.Option value="0 0 0/12 * * *">每12小时</Select.Option>
          <Select.Option value="0 0 0 * * *">每天</Select.Option>
        </Select>
      )
    } else if (d._id === constants.environment.ENABLE_CHROME_DEBUG) {
      return (
        <Select
          value={d.value}
          style={{width: '200px'}}
          onChange={onFieldChange(d)}
        >
          <Select.Option value="Y">开启</Select.Option>
          <Select.Option value="N">关闭</Select.Option>
        </Select>
      );
    } else {
      return d.value
    }
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '变量名',
      dataIndex: 'label',
      key: 'label',
      width: '180px',
    },
    {
      title: '变量值',
      dataIndex: 'value',
      key: 'value',
      width: '180px',
      render: (text, d) => {
        return getValue(d);
      }
    },
  ];

  const onFieldChange: Function = (d: Environment) => {
    return (ev: any) => {
      d.value = ev;
      dispatch({
        type: 'environment/saveEnvironment',
        payload: d,
      });
      const environments = environment.environments ? environment.environments.map((_d: Environment) => {
        if (_d._id === d._id) _d.value = d.value;
        return _d;
      }) : [];
      dispatch({
        type: 'environment/saveEnvironmentList',
        payload: environments,
      });
      message.success('保存成功, 请重启服务器使系统设置生效');

      TDAPP.onEvent('系统设置-更新设置');
    }
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'environment/fetchEnvironmentList'
      })
    }
  }, []);

  TDAPP.onEvent('系统设置-访问页面');

  return (
    <PageHeaderWrapper>
      <Card>
        <Table dataSource={environment.environments} columns={columns}/>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({environment}: ConnectState) => ({
  environment,
}))(EnvironmentList);
