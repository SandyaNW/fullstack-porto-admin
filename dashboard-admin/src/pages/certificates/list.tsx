import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";

export const CertificateList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List createButtonProps={{}}>
      <Table {...tableProps} rowKey="id">

        <Table.Column dataIndex="id" title="ID" />

        <Table.Column dataIndex="title" title="Title" />

        <Table.Column dataIndex="issuer" title="Issuer" />

        <Table.Column dataIndex="issued_date" title="Issued Date" />

        <Table.Column dataIndex="credential_url" title="Credential URL" />

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
