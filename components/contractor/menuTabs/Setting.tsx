import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, CreditCard, Edit3, Save, X, Trash, Calendar, CheckCircle, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormPopup } from "@/components/ui/FormPopup";
import { AddressSuggestion } from "@/components/ui/AddressSuggestion";
import { settingType } from "@/types/DashboardTypes";
import { FormField } from "@/types/Types";
import { toast } from "react-toastify";
import { paymentMethodSchema } from "@/validations/contractor/schema";
import { supabase } from "@/lib/supabase";
import { paymentMethodType } from "@/types/DashboardTypes";
import { PlacePrediction } from "@/types/AuthType";
import LoadingDots from "@/lib/LoadingDots";

export const Setting = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [cards, setCards] = useState<paymentMethodType[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [calendlyConnected, setCalendlyConnected] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<settingType>({
    fullName: "",
    email: "",
    serviceRadius: "",
    businessAddress: "",
    latitude: 0,
    longitude: 0,
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsProfileLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          toast.error("User not logged in");
          return;
        }
        const userId = authData.user.id;

        // 2️⃣ Fetch data from Roofing_Auth table
        const { data, error } = await supabase
          .from("Roofing_Auth")
          .select(
            `"Full Name", "Service Radius", "Business Address", "Email Address", "Phone Number"`
          )
          .eq("user_id", userId)
          .maybeSingle();

        if (!data) {
          console.warn("No Roofing_Auth record found for this user.");
          return;
        }

        setFormData({
          fullName: data["Full Name"] || "",
          email: data["Email Address"] || "",
          serviceRadius: data["Service Radius"] || "",
          businessAddress: data["Business Address"] || "",
          phoneNumber: data["Phone Number"] || ""
        });
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user data");
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkCalendlyStatus = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) return;
        const res = await fetch(`/api/calendly/status?contractorId=${userId}`);
        const { connected } = await res.json();
        setCalendlyConnected(connected);
      } catch {
        setCalendlyConnected(false);
      }
    };
    checkCalendlyStatus();
  }, []);

  const handleConnectCalendly = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) {
      toast.error("User not logged in");
      return;
    }
    window.location.href = `/api/calendly/connect?contractorId=${userId}&after=settings`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = async () => {
    setIsEditing(false);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        toast.error("User not logged in");
        return;
      }
      const userId = authData.user.id;

      const { data, error } = await supabase
        .from("Roofing_Auth")
        .select(
          `"Full Name", "Service Radius", "Business Address", "Phone Number"`
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setFormData({
          fullName: data["Full Name"] || "",
          serviceRadius: data["Service Radius"] || "",
          businessAddress: data["Business Address"] || "",
          phoneNumber: data["Phone Number"],
        });
      }
    } catch (err) {
      console.error("Error restoring data:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        toast.error("User not logged in");
        return;
      }
      const userId = authData.user.id;

      const { error: dbError } = await supabase
        .from("Roofing_Auth")
        .update({
          "Full Name": formData.fullName,
          "Service Radius": formData.serviceRadius,
          "Business Address": formData.businessAddress,
          "Latitude": formData.latitude,
          "Longitude": formData.longitude,
          "Phone Number": formData.phoneNumber,
        })
        .eq("user_id", userId);

      if (dbError) throw dbError;

      toast.success("Profile updated successfully 🎉");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(`Failed to update profile: ${err.message}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Format phone number as user types
    if (field === "phoneNumber") {
      // Remove all non-digits
      const digits = value.replace(/\D/g, "");

      // Format based on length
      if (digits.length <= 3) {
        processedValue = digits;
      } else if (digits.length <= 6) {
        processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else if (digits.length <= 10) {
        processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else {
        // Limit to 10 digits
        processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 min-h-[80vh] max-w-7xl mx-auto">
        <Card className="border-0 shadow-lg w-full md:w-1/2">
          <CardHeader className="bg-gradient-to-r from-[#286BBD]/5 to-[#2563eb]/5">
            <CardTitle className="flex items-center text-[#286BBD] text-xl">
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#122E5F] rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {formData.fullName}
              </h3>
              <p className="text-sm text-gray-600">{formData.email}</p>
              <p className="text-xs mt-1 text-gray-500 w-60 text-center mx-auto break-words whitespace-pre-line">
                {formData.businessAddress}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={isProfileLoading ? "Loading..." : formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  readOnly={!isEditing}
                  className={`text-gray-900 h-11 ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={isProfileLoading ? "Loading..." : formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  readOnly={!isEditing}
                  className={`text-gray-900 h-11 ${
                    !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Radius
                </label>
                <div className="relative">
                  <Input
                    value={isProfileLoading ? "Loading..." : formData.serviceRadius}
                    onChange={(e) =>
                      handleInputChange("serviceRadius", e.target.value)
                    }
                    readOnly={!isEditing}
                    className={`text-gray-900 h-11 pr-16 ${
                      !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    miles
                  </span>
                </div>
              </div>
              {/* <div>
                {isEditing ? (
                  <AddressSuggestion
                    value={formData.businessAddress}
                    onChange={(value) => handleInputChange("businessAddress", value)}
                    onSelect={handleAddressSelect}
                    placeholder="Start typing your business address..."
                    label="Business Address"
                    required={false}
                    error=""
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Address
                    </label>
                    <Input
                      value={isProfileLoading ? "Loading..." : formData.businessAddress}
                      readOnly
                      className="text-gray-900 h-11 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                )}
              </div> */}
            </div>
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="w-full h-11 bg-[#122E5F] hover:bg-[#0f2347] font-semibold"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className={`flex-1 h-11 bg-[#122E5F] hover:bg-[#0f2347] font-semibold ${isProfileLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isProfileLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isProfileLoading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendly Integration Card */}
        <Card className="border-0 shadow-lg w-full md:w-1/2">
          <CardHeader className="bg-gradient-to-r from-[#286BBD]/5 to-[#2563eb]/5">
            <CardTitle className="flex items-center text-[#286BBD] text-xl">
              <Calendar className="h-5 w-5 mr-2" />
              Calendly Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#122E5F] rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              {calendlyConnected === null ? (
                <LoadingDots />
              ) : calendlyConnected ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Connected</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your Calendly account is linked. Leads can be scheduled directly on your calendar.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900">Not Connected</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Connect your Calendly account to allow automatic appointment scheduling with your leads.
                  </p>
                </>
              )}
            </div>
            {calendlyConnected === null ? null : calendlyConnected ? (
              <Button
                onClick={handleConnectCalendly}
                variant="outline"
                className="w-full h-11 border-[#122E5F] text-[#122E5F] hover:bg-[#122E5F] hover:text-white font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect Calendly
              </Button>
            ) : (
              <Button
                onClick={handleConnectCalendly}
                className="w-full h-11 bg-[#122E5F] hover:bg-[#0f2347] font-semibold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Connect Calendly
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
