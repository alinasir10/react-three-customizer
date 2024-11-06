import { useState, useCallback, useRef, useEffect } from "react";
import { useSnapshot } from "valtio";
import { SketchPicker } from "react-color";
import state from "../store";
import Cropper from "react-easy-crop";
import { Dialog, Tab } from "@headlessui/react";
import { HiDownload, HiX } from "react-icons/hi";
import { getCroppedImg } from "../utils/cropImage";

const initialCropSettings = {
  image: null,
  aspect: 1,
  crop: { x: 0, y: 0 },
  zoom: 1,
};

const ImageControls = ({ type, fileInputRef, onFileSelect }) => {
  const snap = useSnapshot(state);
  const isFront = type === "front";
  const hasImage = isFront ? snap.isFrontLogoTexture : snap.isBackLogoTexture;
  const position = isFront ? snap.frontLogoPosition : snap.backLogoPosition;
  const scale = isFront ? snap.frontLogoScale : snap.backLogoScale;
  const rotation = isFront ? snap.frontLogoRotation : snap.backLogoRotation;

  const updateStateValue = (key, value) => {
    if (isFront) {
      state.frontLogoPosition[key] = value;
    } else {
      state.backLogoPosition[key] = value;
    }
  };

  const updateScale = (value) => {
    if (isFront) {
      state.frontLogoScale = value;
    } else {
      state.backLogoScale = value;
    }
  };

  const updateRotation = (value) => {
    if (isFront) {
      state.frontLogoRotation[2] = value;
    } else {
      state.backLogoRotation[2] = value;
    }
  };

  const renderSlider = ({
    label,
    min,
    max,
    step,
    value,
    onChange,
    disabled,
  }) => (
    <div className="flex items-center space-x-4 mb-2">
      <label className="block text-sm font-medium text-gray-700 w-24">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        disabled={disabled}
      />
      <span className="text-sm text-gray-500 w-16 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {snap[`${type}FileName`] || "No file selected"}
        </span>
        <button
          onClick={() => onFileSelect(type)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          Choose File
        </button>
      </div>

      {renderSlider({
        label: "Position X",
        min: -0.06,
        max: 0.08,
        step: 0.01,
        value: position[0],
        onChange: (value) => updateStateValue(0, value),
        disabled: !hasImage,
      })}

      {renderSlider({
        label: "Position Y",
        min: -0.23,
        max: 0.12,
        step: 0.01,
        value: position[1],
        onChange: (value) => updateStateValue(1, value),
        disabled: !hasImage,
      })}

      {renderSlider({
        label: "Scale",
        min: 0.1,
        max: 0.3,
        step: 0.01,
        value: scale,
        onChange: updateScale,
        disabled: !hasImage,
      })}

      {renderSlider({
        label: "Rotation",
        min: 0,
        max: 360,
        step: 1,
        value: rotation[2],
        onChange: updateRotation,
        disabled: !hasImage,
      })}
    </div>
  );
};

const ControlPanel = ({ onExport }) => {
  const snap = useSnapshot(state);
  const fileInputRef = useRef();
  const [cropSettings, setCropSettings] = useState(initialCropSettings);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
    };
  }, [croppedImage]);

  const handleFileSelect = (type) => {
    setCurrentImageType(type);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = () => {
        setCropSettings((prev) => ({ ...prev, image: reader.result }));
        state[`${currentImageType}FileName`] = file.name;
        setIsModalOpen(true);
        setIsLoading(false);
      };

      reader.onerror = () => {
        console.error("Error reading file");
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      setIsLoading(false);
    }
  };

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (!cropSettings.image) return;

      try {
        const cropped = await getCroppedImg(
          cropSettings.image,
          croppedAreaPixels,
        );
        setCroppedImage(cropped);
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    },
    [cropSettings.image],
  );

  const applyCroppedImage = useCallback(() => {
    if (!croppedImage || !currentImageType) return;

    const isFront = currentImageType === "front";
    if (isFront) {
      state.frontLogoDecal = croppedImage;
      state.isFrontLogoTexture = true;
    } else {
      state.backLogoDecal = croppedImage;
      state.isBackLogoTexture = true;
    }

    setIsModalOpen(false);
    setCropSettings(initialCropSettings);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [croppedImage, currentImageType]);

  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-lg shadow-xl p-4">
      <h3 className="font-medium mb-4">T-Shirt Customizer</h3>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />

      <Tab.Group>
        <Tab.List className="flex space-x-2 mb-4">
          {["Color", "Image"].map((tabName) => (
            <Tab
              key={tabName}
              className={({ selected }) =>
                `px-4 py-2 rounded-lg flex-1 transition-all duration-200 ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`
              }
            >
              {tabName}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <SketchPicker
              color={snap.color}
              onChange={(color) => (state.color = color.hex)}
              className="w-full"
            />
          </Tab.Panel>

          <Tab.Panel>
            <Tab.Group>
              <Tab.List className="flex space-x-2 mb-4">
                {["front", "back"].map((side) => (
                  <Tab
                    key={side}
                    onClick={() => (state.selectedTab = side)}
                    className={({ selected }) =>
                      `px-4 py-2 rounded-lg flex-1 transition-all duration-200 capitalize ${
                        selected
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-black hover:bg-gray-300"
                      }`
                    }
                  >
                    {side} Image
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <ImageControls
                    type="front"
                    fileInputRef={fileInputRef}
                    onFileSelect={handleFileSelect}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <ImageControls
                    type="back"
                    fileInputRef={fileInputRef}
                    onFileSelect={handleFileSelect}
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <button
        onClick={onExport}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center space-x-2 mt-4 transition-colors"
        disabled={isLoading}
      >
        <HiDownload className="w-5 h-5" />
        <span>Export Design</span>
      </button>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <Dialog.Title className="text-lg font-medium flex justify-between items-center">
              Crop Image
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </button>
            </Dialog.Title>
            <div className="relative w-full h-64 mt-4">
              {cropSettings.image ? (
                <Cropper
                  image={cropSettings.image}
                  crop={cropSettings.crop}
                  zoom={cropSettings.zoom}
                  aspect={cropSettings.aspect}
                  onCropChange={(crop) =>
                    setCropSettings((prev) => ({ ...prev, crop }))
                  }
                  onZoomChange={(zoom) =>
                    setCropSettings((prev) => ({ ...prev, zoom }))
                  }
                  onCropComplete={onCropComplete}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500">
                    No image selected for cropping.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={applyCroppedImage}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
              disabled={!croppedImage}
            >
              Apply
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const ControlPanelMug = ({ onExport }) => {
  const initialCropSettings = {
    image: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 2,
  };
  const snap = useSnapshot(state);
  const fileInputRef = useRef();
  const [cropSettings, setCropSettings] = useState(initialCropSettings);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
    };
  }, [croppedImage]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = () => {
        setCropSettings((prev) => ({ ...prev, image: reader.result }));
        state.mugWrapFileName = file.name;
        setIsModalOpen(true);
        setIsLoading(false);
      };

      reader.onerror = () => {
        console.error("Error reading file");
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      setIsLoading(false);
    }
  };

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (!cropSettings.image) return;

      try {
        const cropped = await getCroppedImg(
          cropSettings.image,
          croppedAreaPixels,
        );
        setCroppedImage(cropped);
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    },
    [cropSettings.image],
  );

  const applyCroppedImage = useCallback(() => {
    if (!croppedImage) return;

    state.mugWrapTexture = croppedImage;
    state.isMugWrapTextureVisible = true;

    setIsModalOpen(false);
    setCropSettings(initialCropSettings);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [croppedImage]);

  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-lg shadow-xl p-4">
      <h3 className="font-medium mb-4">Mug Customizer</h3>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />

      <Tab.Group>
        <Tab.List className="flex space-x-2 mb-4">
          {["Color", "Image"].map((tabName) => (
            <Tab
              key={tabName}
              className={({ selected }) =>
                `px-4 py-2 rounded-lg flex-1 transition-all duration-200 ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`
              }
            >
              {tabName}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <SketchPicker
              color={snap.color}
              onChange={(color) => (state.color = color.hex)}
              className="w-full"
            />
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Wrap Around Image</h4>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleFileSelect}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {snap.mugWrapFileName || "Upload Image"}
                  </button>

                  {snap.isMugWrapTextureVisible && (
                    <button
                      onClick={() => {
                        state.isMugWrapTextureVisible = false;
                        state.mugWrapTexture = null;
                        state.mugWrapFileName = "";
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {snap.isMugWrapTextureVisible && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Image Adjustments</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm mb-1">Scale</label>
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={snap.mugWrapScale[0]}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          state.mugWrapScale = [value, value * 0.625, 1];
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        Vertical Position
                      </label>
                      <input
                        type="range"
                        min="-0.2"
                        max="0.2"
                        step="0.01"
                        value={snap.mugWrapPosition[1]}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          state.mugWrapPosition = [0, value, 0];
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <button
        onClick={onExport}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center space-x-2 mt-4 transition-colors"
        disabled={isLoading}
      >
        <HiDownload className="w-5 h-5" />
        <span>Export Design</span>
      </button>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <Dialog.Title className="text-lg font-medium flex justify-between items-center">
              Crop Image
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </button>
            </Dialog.Title>
            <div className="relative w-full h-64 mt-4">
              {cropSettings.image ? (
                <Cropper
                  image={cropSettings.image}
                  crop={cropSettings.crop}
                  zoom={cropSettings.zoom}
                  aspect={2}
                  onCropChange={(crop) =>
                    setCropSettings((prev) => ({ ...prev, crop }))
                  }
                  onZoomChange={(zoom) =>
                    setCropSettings((prev) => ({ ...prev, zoom }))
                  }
                  onCropComplete={onCropComplete}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500">
                    No image selected for cropping.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={applyCroppedImage}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
              disabled={!croppedImage}
            >
              Apply
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ControlPanelMug;

export { ControlPanel, ControlPanelMug };
