import { Edit } from "@refinedev/antd";
import { Form, Input, Upload, Button, message, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useApiUrl, useNavigation} from "@refinedev/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const ProjectEdit = () => {
  const apiUrl = useApiUrl();
  const { list } = useNavigation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Axios Instance dengan Token
  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("my_access_token");
    if (token && config.headers) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });

  // Fetch Data Lama
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get(`${apiUrl}/projects/${id}`);
        form.setFieldsValue({
            title: data.title,
            description: data.description,
            tech_stack: data.tech_stack,
            demo_url: data.demo_url,
            repo_url: data.repo_url,
        });
        setCurrentImage(data.image);
      } catch (error) {
        message.error("Gagal mengambil data project");
      }
    };
    if(id) fetchData();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("tech_stack", values.tech_stack);
      if (values.demo_url) formData.append("demo_url", values.demo_url);
      if (values.repo_url) formData.append("repo_url", values.repo_url);

      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0].originFileObj);
      }

      await axiosInstance.patch(`${apiUrl}/projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Project berhasil diupdate!");
      list("projects");
    } catch (error: any) {
        if (error.response?.status === 401) window.location.href = "/login";
        else message.error("Gagal update project");
    }
  };

  return (
    <Edit title="Edit Project" saveButtonProps={{ hidden: true }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Tech Stack" name="tech_stack" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Demo URL" name="demo_url"><Input /></Form.Item>
        <Form.Item label="Repo URL" name="repo_url"><Input /></Form.Item>

        <Form.Item label="Current Image">
           {currentImage ? <Image width={200} src={`${apiUrl}/${currentImage}`} /> : <span style={{color:'gray'}}>Tidak ada gambar</span>}
        </Form.Item>

        <Form.Item label="Change Image" name="image" valuePropName="fileList" getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}>
          <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
            <Button icon={<UploadOutlined />}>Click to Change</Button>
          </Upload>
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large">Update Project</Button>
      </Form>
    </Edit>
  );
};