import { Create } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";

export const CertificateCreate = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl();
  const [form] = Form.useForm();

  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("issuer", values.issuer);
      formData.append("issued_date", values.issued_date);
      if (values.credential_url) {
        formData.append("credential_url", values.credential_url);
      }

      await axiosInstance.post(`${apiUrl}/certificates`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Sertifikat berhasil ditambahkan!");
      list("certificates");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal menambah sertifikat";
        message.error(msg);
      }
    }
  };

  return (
    <Create title="Add Certificate" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="Certificate Name" name="title" rules={[{ required: true, message: "Nama sertifikat wajib diisi" }]}>
          <Input placeholder="Contoh: AWS Certified Cloud Practitioner" />
        </Form.Item>

        <Form.Item label="Issuer (Penerbit)" name="issuer" rules={[{ required: true, message: "Penerbit wajib diisi" }]}>
          <Input placeholder="Contoh: Amazon Web Services" />
        </Form.Item>

        <Form.Item label="Issued Date" name="issued_date" rules={[{ required: true, message: "Tanggal terbit wajib diisi" }]}>
          <Input type="date" placeholder="Pilih tanggal" />
        </Form.Item>

        <Form.Item label="Credential URL" name="credential_url">
          <Input placeholder="Contoh: https://aws.amazon.com/verify..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Certificate
        </Button>

      </Form>
    </Create>
  );
};