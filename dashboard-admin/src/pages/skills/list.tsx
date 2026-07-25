import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const SkillList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List createButtonProps={{}}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Skill Name" />
        <Table.Column 
          dataIndex="level" 
          title="Level" 
          render={(value: string) => {
            let color = "default";
            if (value.toLowerCase() === "expert") color = "success";
            else if (value.toLowerCase() === "advanced") color = "processing";
            else if (value.toLowerCase() === "intermediate") color = "warning";
            return <Tag color={color}>{value}</Tag>;
          }}
        />
        <Table.Column dataIndex="category" title="Category" />
        <Table.Column
          title="Actions"
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
