import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";
import useBecomeOwner from "../../hooks/useBecomeOwner";
import LocationPickerMap from "../../components/turf/LocationPickerMap";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

const BecomeOwner = () => {
  const {
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
  } = useBecomeOwner();

  return (
    <div className="container mx-auto mt-20 p-2">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Become a Turf Owner
      </h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
            <h2 className="text-lg font-bold text-emerald-400 border-b border-white/10 pb-2 mb-2">
              1. Owner Contact Details
            </h2>
            <FormField
              label="Full Name"
              name="name"
              type="text"
              register={register}
              error={errors.name}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="text"
              register={register}
              error={errors.phone}
            />

            <h2 className="text-lg font-bold text-emerald-400 border-b border-white/10 pb-2 pt-4 mb-2">
              2. Turf Venue Details
            </h2>
            <FormField
              label="Turf Arena Name"
              name="turfName"
              type="text"
              register={register}
              error={errors.turfName}
            />
            <FormField
              label="Turf Physical Address"
              name="address"
              type="text"
              register={register}
              error={errors.address}
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Base Price Per Hour (₹)</span>
              </label>
              <input
                type="number"
                placeholder="1000"
                className="input input-bordered w-full"
                {...register("pricePerHour")}
              />
              {errors.pricePerHour && (
                <span className="text-error text-xs mt-1">{errors.pricePerHour.message}</span>
              )}
            </div>

            {/* Sport Types Selector */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Available Sports</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes("Cricket")}
                    onChange={() => toggleSport("Cricket")}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="text-sm">🏏 Box Cricket</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes("Football")}
                    onChange={() => toggleSport("Football")}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="text-sm">⚽ Football / Futsal</span>
                </label>
              </div>
            </div>

            {/* Interactive Location Map Pin */}
            <div className="pt-2">
              <LocationPickerMap location={location} onChange={setLocation} />
            </div>

            {/* Turf Photo Upload Section */}
            <div className="form-control pt-2">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-emerald-400" />
                  <span>Turf Photos (Minimum 1 Required)</span>
                </span>
                <span className="label-text-alt text-xs text-slate-400">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
                </span>
              </label>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-xl cursor-pointer bg-slate-900/50 transition-colors">
                <UploadCloud className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Click to select photos or drag & drop
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP (Up to 10 photos)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-slate-800">
                      <img
                        src={photo.preview}
                        alt={`Turf preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/80 text-white hover:bg-rose-600 transition-colors shadow"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="btn btn-primary w-full mt-6" loading={loading}>
              Submit Application
            </Button>
          </form>
        </div>


        {/* content section */}
        <div className=" ">
          <div className=" shadow-md border p-6 rounded-lg h-full">
            <h2 className="text-2xl font-semibold mb-4">
              Becoming a Turf Owner
            </h2>
            <p className="mb-4">
              Join our platform as a turf owner and start managing your sports
              facilities efficiently. Here&#39;s what you need to know:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Fill out the application form with your details.</li>
              <li>Our admin team will review your application thoroughly.</li>
              <li>
                You&#39;ll receive an email with the decision on your
                application.
              </li>
              <li>
                If approved, the email will contain a link to create your owner
                account.
              </li>
              <li>
                Once your account is set up, you can start managing your turf
                business.
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-2">
              As a Turf Owner, you can:
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Add and manage multiple turfs</li>
              <li>View and handle bookings</li>
              <li>Manage payments and transactions</li>
              <li>Set availability and pricing</li>
              <li>Communicate with customers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeOwner;
