import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";

export const ExperienceList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List createButtonProps={{}}>
      <Table {...tableProps} rowKey="id">

        <Table.Column dataIndex="id" title="ID" />

        <Table.Column dataIndex="company_name" title="Company" />

        <Table.Column dataIndex="role" title="Role" />

        <Table.Column
          title="Year"
          render={(_, r: any) => `${r.start_year} - ${r.end_year}`}
        />

        <Table.Column
          dataIndex="description"
          title="Description"
        />

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
