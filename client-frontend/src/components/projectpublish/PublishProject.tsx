import React, { useState } from "react";

export default function PublishProject({
  isOpen,
  onClose,
  onPublish,
  nextId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (project: any) => void;
  nextId: string;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    completionDate: "",

    // Multiple sample links
    sampleLinks: [
      {
        title: "",
        url: "",
      },
    ],

    // Skills
    skills: ["React", "Tailwind CSS"],
    currentSkillInput: "",

    // Multiple sample documents/images
    sampleFiles: [
      {
        title: "",
        file: null,
      },
    ],
  });

  if (!isOpen) return null;

  // ==========================================
  // SKILLS
  // ==========================================

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const val = formData.currentSkillInput
        .trim()
        .replace(",", "");

      if (val && !formData.skills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, val],
          currentSkillInput: "",
        }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  // ==========================================
  // SAMPLE LINKS
  // ==========================================

  // Add new sample link
  const handleAddSampleLink = () => {
    setFormData((prev) => ({
      ...prev,
      sampleLinks: [
        ...prev.sampleLinks,
        {
          title: "",
          url: "",
        },
      ],
    }));
  };

  // Update sample link
  const handleSampleLinkChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      sampleLinks: prev.sampleLinks.map(
        (link, i) =>
          i === index
            ? {
                ...link,
                [field]: value,
              }
            : link
      ),
    }));
  };

  // Remove sample link
  const handleRemoveSampleLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sampleLinks: prev.sampleLinks.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ==========================================
  // SAMPLE FILES
  // ==========================================

  // Add new sample file
  const handleAddSampleFile = () => {
    setFormData((prev) => ({
      ...prev,
      sampleFiles: [
        ...prev.sampleFiles,
        {
          title: "",
          file: null,
        },
      ],
    }));
  };

  // Update sample file
  const handleSampleFileChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      sampleFiles: prev.sampleFiles.map(
        (item, i) =>
          i === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      ),
    }));
  };

  // Remove sample file
  const handleRemoveSampleFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sampleFiles: prev.sampleFiles.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedToday = `${String(
      today.getDate()
    ).padStart(2, "0")} ${
      months[today.getMonth()]
    } ${today.getFullYear()}`;

    const num = Number(formData.amount);

    const formattedAmount =
      "₹" +
      (isNaN(num)
        ? "0"
        : num.toLocaleString("en-IN"));

    // ------------------------------------------
    // Remove completely empty sample links
    // ------------------------------------------

    const validSampleLinks =
      formData.sampleLinks.filter(
        (link) =>
          link.title.trim() !== "" ||
          link.url.trim() !== ""
      );

    // ------------------------------------------
    // Remove completely empty sample files
    // ------------------------------------------

    const validSampleFiles =
      formData.sampleFiles.filter(
        (item) =>
          item.title.trim() !== "" ||
          item.file !== null
      );

    // ------------------------------------------
    // New Project
    // ------------------------------------------

    const newProject = {
      id: nextId,

      name: formData.title,

      description:
        formData.description ||
        "Custom scope deliverables",

      amount: formattedAmount,

      status: "PUBLISH",

      approaches: 0,

      postedDate: formattedToday,

      skills: formData.skills,

      // Multiple sample links
      sampleLinks: validSampleLinks,

      // Multiple sample files
      sampleFiles: validSampleFiles,

      completionDate:
        formData.completionDate,
    };

    onPublish(newProject);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">

          <h2 className="text-base font-bold text-slate-900 font-serif">
            Publish new project
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            ✕
          </button>

        </div>

        {/* ==================================
            FORM
        ================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-4.5 text-xs"
        >

          {/* ==================================
              PROJECT TITLE
          ================================== */}

          <div>

            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Project Title
            </label>

            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Client onboarding portal"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />

          </div>

          {/* ==================================
              PROJECT DESCRIPTION
          ================================== */}

          <div>

            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Project Description
            </label>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe the scope and deliverables..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            />

          </div>

          {/* ==================================
              REQUIRED SKILLS
          ================================== */}

          <div>

            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Required Skills
            </label>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-1.5 min-h-[44px]">

              {formData.skills.map((skill) => (

                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >

                  {skill}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSkill(skill)
                    }
                    className="text-blue-500 hover:text-blue-800 font-bold ml-0.5"
                  >
                    ×
                  </button>

                </span>

              ))}

              <input
                type="text"
                value={formData.currentSkillInput}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentSkillInput:
                      e.target.value,
                  })
                }
                onKeyDown={handleAddSkill}
                placeholder="Type skill & press Enter..."
                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 outline-none px-1.5 py-1"
              />

            </div>

          </div>

          {/* ==================================
              AMOUNT & COMPLETION DATE
          ================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Amount */}

            <div>

              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Project Amount (₹)
              </label>

              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
                placeholder="15000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />

            </div>

            {/* Completion Date */}

            <div>

              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Completion Date
              </label>

              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionDate:
                      e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />

            </div>

          </div>

          {/* ==================================
              SAMPLE LINKS
          ================================== */}

          <div>

            {/* Header */}

            <div className="flex items-center justify-between mb-1.5">

              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Sample Links
              </label>

              <button
                type="button"
                onClick={handleAddSampleLink}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add New Link
              </button>

            </div>

            {/* Links */}

            <div className="space-y-3">

              {formData.sampleLinks.map(
                (link, index) => (

                  <div
                    key={index}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >

                    {/* Link Header */}

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-[11px] font-bold text-slate-500">
                        Sample Link {index + 1}
                      </span>

                      {formData.sampleLinks.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSampleLink(
                              index
                            )
                          }
                          className="text-[11px] text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>

                      )}

                    </div>

                    {/* Link Title */}

                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) =>
                        handleSampleLinkChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder={`Sample ${
                        index + 1
                      } title`}
                      className="w-full px-3.5 py-2.5 mb-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    {/* Link URL */}

                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleSampleLinkChange(
                          index,
                          "url",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                  </div>

                )
              )}

            </div>

          </div>

          {/* ==================================
              SAMPLE DOCS & IMAGES
          ================================== */}

          <div>

            {/* Header */}

            <div className="flex items-center justify-between mb-1.5">

              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Sample Docs & Images
              </label>

              <button
                type="button"
                onClick={handleAddSampleFile}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add New File
              </button>

            </div>

            {/* Files */}

            <div className="space-y-3">

              {formData.sampleFiles.map(
                (item, index) => (

                  <div
                    key={index}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >

                    {/* File Header */}

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-[11px] font-bold text-slate-500">
                        Sample File {index + 1}
                      </span>

                      {formData.sampleFiles.length >
                        1 && (

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSampleFile(
                              index
                            )
                          }
                          className="text-[11px] text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>

                      )}

                    </div>

                    {/* File Title */}

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleSampleFileChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder={`Sample ${
                        index + 1
                      } title`}
                      className="w-full px-3.5 py-2.5 mb-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    {/* File Upload */}

                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">

                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        className="hidden"
                        onChange={(e) => {

                          const file =
                            e.target.files?.[0] ||
                            null;

                          handleSampleFileChange(
                            index,
                            "file",
                            file
                          );

                          // Allow selecting same file again
                          e.target.value = "";

                        }}
                      />

                      <svg
                        className="w-6 h-6 text-blue-600 mb-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>

                      {item.file ? (

                        <>
                          <p className="text-xs font-semibold text-blue-600 truncate max-w-full px-2">
                            {(item.file as any).name}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1">
                            Click to replace file
                          </p>
                        </>

                      ) : (

                        <>
                          <p className="text-xs font-medium text-slate-700">
                            Click to upload file
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1 text-center">
                            Images, PDF, DOC, DOCX,
                            XLS, XLSX, PPT, PPTX
                          </p>
                        </>

                      )}

                    </label>

                  </div>

                )
              )}

            </div>

          </div>

          {/* ==================================
              FOOTER BUTTONS
          ================================== */}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20"
            >
              Publish
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}