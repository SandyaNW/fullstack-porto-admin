import { Create } from "@refinedev/antd";
import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import { useNavigation, useApiUrl } from "@refinedev/core";

export const SkillCreate = () => {
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
      formData.append("name", values.name);
      formData.append("level", values.level);
      formData.append("category", values.category);

      await axiosInstance.post(`${apiUrl}/skills`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Keahlian (Skill) berhasil ditambahkan!");
      list("skills");
      
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.response?.status === 401) {
        message.error("Sesi habis, silakan login kembali");
        window.location.href = "/login";
      } else {
        const msg = error.response?.data?.detail || "Gagal menambah keahlian";
        message.error(msg);
      }
    }
  };

  return (
    <Create title="Add Skill" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Form.Item label="Skill Name" name="name" rules={[{ required: true, message: "Nama keahlian wajib diisi" }]}>
          <Input placeholder="Contoh: React, Node.js, Docker" />
        </Form.Item>

        <Form.Item label="Skill Level" name="level" rules={[{ required: true, message: "Level keahlian wajib diisi" }]}>
          <Select placeholder="Pilih level keahlian">
            <Select.Option value="Beginner">Beginner</Select.Option>
            <Select.Option value="Intermediate">Intermediate</Select.Option>
            <Select.Option value="Advanced">Advanced</Select.Option>
            <Select.Option value="Expert">Expert</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Category" name="category" rules={[{ required: true, message: "Kategori wajib diisi" }]}>
          <Select placeholder="Pilih kategori">
            <Select.Option value="Frontend">Frontend</Select.Option>
            <Select.Option value="Backend">Backend</Select.Option>
            <Select.Option value="Tools/DevOps">Tools/DevOps</Select.Option>
            <Select.Option value="Others">Others</Select.Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Skill
        </Button>

      </Form>
    </Create>
  );
};
