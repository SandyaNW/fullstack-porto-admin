import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Image } from "antd";

// URL Backend FastAPI
const API_URL = "http://localhost:8000";

export const ProjectList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        
        <Table.Column
          dataIndex="image"
          title="Image"
          render={(value) => (
            <Image
              width={50}
              src={value ? (value.startsWith('http') ? value : `${API_URL}/${value}`) : "error"} 
              alt="Project"
            />
          )}
        />

        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="tech_stack" title="Tech Stack" />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};