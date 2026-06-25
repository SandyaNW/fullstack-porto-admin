import { Edit } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const ContactEdit = () => {
  const { list } = useNavigation();
  const apiUrl = useApiUrl();
  const { id } = useParams();
  const [form] = Form.useForm();

  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get(`${apiUrl}/contacts`);
        const current = data.find((item: any) => item.id === Number(id));
        
        if (current) {
          form.setFieldsValue({
            platform: current.platform,
            value: current.value,
            url: current.url,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
    };

    if (id) fetchData();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("platform", values.platform);
      formData.append("value", values.value);
      formData.append("url", values.url);

      await axiosInstance.patch(`${apiUrl}/contacts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kontak berhasil diupdate!");
      list("contacts");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal update kontak";
        message.error(msg);
      }
    }
  };

  return (
    <Edit title="Edit Contact Link" saveButtonProps={{ hidden: true }}>
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
          Update Contact
        </Button>

      </Form>
    </Edit>
  );
};