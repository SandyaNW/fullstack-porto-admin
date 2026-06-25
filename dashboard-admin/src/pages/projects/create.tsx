// src/pages/projects/create.tsx
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useApiUrl, useCustomMutation } from "@refinedev/core";
import axios from "axios";

export const ProjectCreate = () => {
  const apiUrl = useApiUrl();
  const [form] = Form.useForm();

  // Buat axios instance dengan interceptor
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
      console.log("Form values:", values); // Debug
      
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("tech_stack", values.tech_stack);
      
      if (values.demo_url) formData.append("demo_url", values.demo_url);
      if (values.repo_url) formData.append("repo_url", values.repo_url);

      // Handle file upload
      if (values.image && values.image.length > 0) {
        const file = values.image[0].originFileObj;
        console.log("File to upload:", file); // Debug
        formData.append("image", file);
      }

      // Cek token sebelum kirim request
      const token = localStorage.getItem("my_access_token");
      console.log("Token:", token); // Debug

      const response = await axiosInstance.post(`${apiUrl}/projects`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response); // Debug
      message.success("Project berhasil dibuat!");
      
      // Redirect ke list page
      window.location.href = "/projects";
      
    } catch (error: any) {
      console.error("Error details:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized - Silakan login kembali");
        // Redirect ke login
        window.location.href = "/login";
      } else {
        message.error("Gagal membuat project: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <Create 
      title="Create New Project" 
      saveButtonProps={{ hidden: true }}
      headerButtons={[]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Judul wajib diisi" }]}
        >
          <Input placeholder="Contoh: Website Toko Online" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
        >
          <Input.TextArea rows={4} placeholder="Jelaskan fitur project ini..." />
        </Form.Item>

        <Form.Item
          label="Tech Stack"
          name="tech_stack"
          rules={[{ required: true, message: "Tech Stack wajib diisi" }]}
        >
          <Input placeholder="Contoh: React, Laravel, MySQL" />
        </Form.Item>

        <Form.Item label="Demo URL" name="demo_url">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item label="Repo URL" name="repo_url">
          <Input placeholder="https://github.com/..." />
        </Form.Item>

        <Form.Item
          label="Project Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
        >
          <Upload 
            beforeUpload={() => false}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Save Project
        </Button>
      </Form>
    </Create>
  );
};