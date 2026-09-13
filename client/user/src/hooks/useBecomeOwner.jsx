import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "./useAxiosInstance";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const becomeOwnerSchema = yup.object().shape({
  name: yup.string().required("Your full name is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm,
      "Enter a valid email address"
    ),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
    .min(10, "Phone number must be exactly 10 digits")
    .max(10, "Phone number must be exactly 10 digits"),
  turfName: yup.string().required("Turf arena name is required"),
  address: yup.string().required("Full physical address is required"),
  pricePerHour: yup
    .number()
    .typeError("Enter a valid hourly price")
    .positive("Price must be greater than 0")
    .required("Hourly price is required"),
});

const useBecomeOwner = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 26.8533, lng: 75.7684 }); // Default Jaipur
  const [photos, setPhotos] = useState([]);
  const [selectedSports, setSelectedSports] = useState(["Cricket", "Football"]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(becomeOwnerSchema),
    defaultValues: {
      pricePerHour: 1000,
    },
  });

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview: reader.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSport = (sport) => {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.length > 1
          ? prev.filter((s) => s !== sport)
          : prev
        : [...prev, sport]
    );
  };

  const onSubmit = async (data) => {
    if (photos.length === 0) {
      toast.error("Please upload at least 1 photo of your turf.");
      return;
    }

    if (!location || isNaN(location.lat) || isNaN(location.lng)) {
      toast.error("Please set a valid map location for your turf.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("turfName", data.turfName);
      formData.append("address", data.address);
      formData.append("pricePerHour", data.pricePerHour);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
      formData.append("coordinates", JSON.stringify([location.lng, location.lat]));
      formData.append("sportTypes", JSON.stringify(selectedSports));

      // Append files
      photos.forEach((p) => {
        if (p.file) {
          formData.append("photos", p.file);
        }
      });

      // Also append preview data URLs so fallback works even if multipart file handling is bypassed
      formData.append(
        "images",
        JSON.stringify(photos.map((p) => p.preview).filter(Boolean))
      );

      const response = await axiosInstance.post(
        "/api/owner/auth/ownerRequest",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data?.message || "Application submitted successfully!");
      navigate("/auth");
    } catch (error) {
      console.error("Become owner submit error:", error);
      const msg =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors[0]?.msg
          : null) ||
        "Failed to submit application. Please check your fields.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    loading,
    location,
    setLocation,
    photos,
    handlePhotoUpload,
    removePhoto,
    selectedSports,
    toggleSport,
  };
};

export default useBecomeOwner;