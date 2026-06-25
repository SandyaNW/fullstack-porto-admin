import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";

export const ContactList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List createButtonProps={{}}>
      <Table {...tableProps} rowKey="id">

        <Table.Column dataIndex="id" title="ID" />

        <Table.Column dataIndex="platform" title="Platform" />

        <Table.Column dataIndex="value" title="Value" />

        <Table.Column dataIndex="url" title="URL" />

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
