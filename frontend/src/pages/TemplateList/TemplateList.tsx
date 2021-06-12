import React, { useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Template } from '@/models/template';
import { connect, ConnectProps, history } from 'umi';
import { ConnectState, Dispatch } from '@/models/connect';
import "@ant-design/compatible/assets/index.css";
import  { ColumnProps } from 'antd/lib/table';
import { Button, Card, Tooltip,Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export interface TemplatesListProps extends ConnectProps {
    templateList: Template[];
    dispatch: Dispatch;
}

const onGoTemplateEdit = (d: Template) => {
    return () => {
        history.push(`/templates/edit/${d._id}`);
    }
}

const onGoTemplateCreate = () => {
        history.push('/templates/create');
}

const TemplatesList: React.FC<TemplatesListProps> = props => {
    const { dispatch, templateList } = props;

    useEffect(() => {
        dispatch({
            type: '/template/list',
        })
    })
    const templateColumns: ColumnProps < any > [] =[
        {
            title: '模版名称',
            dataIndex: 'name',
            key: 'name',
            width: 'auto',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '180px',
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: '180px',
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            width: '200px',
            render: (text, d) => {
                return (
                    <div>
                        <Tooltip title="编辑">
                            <Button
                                type="default"
                                icon={<EditOutlined />}
                                shape="circle"
                                onClick={onGoTemplateEdit(d)}
                            />

                        </Tooltip>
                    </div>
                );
            }
        },
    ];

return (
    <PageHeaderWrapper>
        <div>
            <Button type="primary" onClick={onGoTemplateCreate}>创建模版</Button>
        </div>
        <Card>
            <Table dataSource={templateList} columns={templateColumns }
                rowKey={record => record._id}>
            </Table>
        </Card>
    </PageHeaderWrapper>
);
}

export default connect(({ template }: ConnectState) => ({
    templateList: template.templateList,
}))(TemplatesList);