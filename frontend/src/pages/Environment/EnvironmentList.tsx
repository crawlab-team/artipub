import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Card, Input, message, Select, Table} from 'antd';
import { ConnectState, Dispatch } from "@/models/connect";
import {connect, ConnectProps} from 'umi';
import {ColumnProps} from 'antd/lib/table';
import { Environment, EnvironmentModelState } from "@/models/environment";
import {TemplateModelState} from "@/models/template";
import constants from '../../constants';

export interface EnvironmentListProps extends ConnectProps {
  environment: EnvironmentModelState;
  template: TemplateModelState;
  dispatch: Dispatch;
}

const EnvironmentList: React.FC<EnvironmentListProps> = props => {
  const {dispatch, environment, template} = props;

  const getValue = (d: Environment) => {
    if (d.name === constants.environment.UPDATE_STATS_CRON) {
      return (
        <Select
          value={d.value}
          style={{ width: "200px" }}
          onChange={onFieldChange(constants.inputType.SELECT, d)}
        >
          <Select.Option value="0 0/5 * * * *">每5分钟</Select.Option>
          <Select.Option value="0 0/10 * * * *">每10分钟</Select.Option>
          <Select.Option value="0 0/30 * * * *">每30分钟</Select.Option>
          <Select.Option value="0 0 * * * *">每1小时</Select.Option>
          <Select.Option value="0 0 0/6 * * *">每6小时</Select.Option>
          <Select.Option value="0 0 0/12 * * *">每12小时</Select.Option>
          <Select.Option value="0 0 0 * * *">每天</Select.Option>
        </Select>
      );
    } else if (d.name === constants.environment.ENABLE_CHROME_DEBUG) {
      return (
        <Select
          value={d.value}
          style={{ width: "200px" }}
          onChange={onFieldChange(constants.inputType.SELECT, d)}
        >
          <Select.Option value="Y">开启</Select.Option>
          <Select.Option value="N">关闭</Select.Option>
        </Select>
      );
    } else if (
      d.name === constants.environment.HEAD_TEMPLATE_ID ||
      d.name === constants.environment.TAIL_TEMPLATE_ID
    ) {
      return (
        <Select
          value={d.value}
          style={{ width: "200px" }}
          onChange={onFieldChange(constants.inputType.SELECT, d)}
        >
          {template.templateList.map(t => (<Select.Option value={t.id}>{t.name}</Select.Option>))}
          
        </Select>
      );
    } else {
      return (
        <Input
          value={d.value}
          style={{ width: "200px" }}
          onChange={onFieldChange(constants.inputType.INPUT, d)}
          onBlur={onSave(d)}
          placeholder={d.label}
        />
      );
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

  const onFieldChange: Function = (type: string, d: Environment) => {
    return (ev: any) => {
      if (type === constants.inputType.SELECT) {
        d.value = ev;
        onSave(d)();
      } else {
        d.value = ev.target.value;
      }

      const environments = environment.environments ? environment.environments.map((_d: Environment) => {
        if (_d._id === d._id) _d.value = d.value;
        return _d;
      }) : [];

      dispatch({
        type: 'environment/saveEnvironmentList',
        payload: environments,
      });
    }
  };

  const onSave: Function = (d: Environment) => {
    return () => {
      dispatch({
        type: 'environment/saveEnvironment',
        payload: d,
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
      dispatch({
        type: 'template/getTemplateList'
      })
    }
  }, []);

  TDAPP.onEvent('系统设置-访问页面');

  return (
    <PageHeaderWrapper>
      <Card>
        <Table
          dataSource={environment.environments ? environment.environments.filter((d: Environment) => ![
            constants.environment.WECHAT_ACCESS_TOKEN,
          ].includes(d._id || '')) : []}
          columns={columns} rowKey={record => record._id}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({environment, template}: ConnectState) => ({
  environment,
  template,
}))(EnvironmentList);
