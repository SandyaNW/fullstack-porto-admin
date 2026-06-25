import { Create } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";

export const ContactCreate = () => {
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
      formData.append("platform", values.platform);
      formData.append("value", values.value);
      formData.append("url", values.url);

      await axiosInstance.post(`${apiUrl}/contacts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kontak berhasil ditambahkan!");
      list("contacts");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal menambah kontak";
        message.error(msg);
      }
    }
  };

  return (
    <Create title="Add Contact Link" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="Platform Name" name="platform" rules={[{ required: true, message: "Nama platform wajib diisi" }]}>
          <Input placeholder="Contoh: WhatsApp" />
        </Form.Item>

        <Form.Item label="Display Text" name="value" rules={[{ required: true, message: "Teks tampilan wajib diisi" }]}>
          <Input placeholder="Contoh: +62 812-3456-7890" />
        </Form.Item>

        <Form.Item label="URL / Link Target" name="url" rules={[{ required: true, message: "URL tujuan wajib diisi" }]}>
          <Input placeholder="Contoh: https://wa.me/6281234567890" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Contact
        </Button>

      </Form>
    </Create>
  );
};