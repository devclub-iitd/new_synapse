// import React from 'react';
// import { Plus, Trash, List } from 'lucide-react';

// const DynamicFormBuilder = ({ schema, setSchema }) => {
  
//   const addField = () => {
//     setSchema([...schema, { label: "", type: "text", options: [] }]);
//   };

//   const removeField = (index) => {
//     const newSchema = schema.filter((_, i) => i !== index);
//     setSchema(newSchema);
//   };

//   const updateField = (index, key, value) => {
//     const newSchema = [...schema];
//     newSchema[index][key] = value;
//     setSchema(newSchema);
//   };

//   const handleOptionsChange = (index, value) => {
//     // Convert comma string to array
//     const optionsArray = value.split(',').map(s => s.trim());
//     updateField(index, 'options', optionsArray);
//   };

//   return (
//     <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #555' }}>
//       <h6 className="text-secondary text-uppercase mb-3">Registration Form Builder</h6>
      
//       {schema.map((field, idx) => (
//         <div key={idx} className="mb-3 p-3 rounded bg-dark border border-secondary position-relative">
//           <button 
//             type="button" 
//             className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
//             onClick={() => removeField(idx)}
//           >
//             <Trash size={14} />
//           </button>

//           <div className="row g-2">
//             <div className="col-md-7">
//               <label className="small text-muted">Question Label</label>
//               <input 
//                 type="text" 
//                 className="form-control bg-transparent text-white border-secondary"
//                 placeholder="e.g. T-Shirt Size"
//                 value={field.label}
//                 onChange={(e) => updateField(idx, 'label', e.target.value)}
//                 required
//               />
//             </div>
//             <div className="col-md-5">
//               <label className="small text-muted">Answer Type</label>
//               <select 
//                 className="form-select bg-dark text-white border-secondary"
//                 value={field.type}
//                 onChange={(e) => updateField(idx, 'type', e.target.value)}
//               >
//                 <option value="text">Text Input</option>
//                 <option value="radio">Multiple Choice (Radio)</option>
//               </select>
//             </div>
//           </div>

//           {/* Show Options input only for Radio */}
//           {field.type === 'radio' && (
//             <div className="mt-2">
//               <label className="small text-muted">Options (Comma separated)</label>
//               <input 
//                 type="text" 
//                 className="form-control bg-transparent text-white border-secondary"
//                 placeholder="Small, Medium, Large"
//                 onChange={(e) => handleOptionsChange(idx, e.target.value)}
//               />
//             </div>
//           )}
//         </div>
//       ))}

//       <button type="button" className="btn btn-outline-primary btn-sm w-100 border-dashed" onClick={addField}>
//         <Plus size={16} /> Add Question
//       </button>
//     </div>
//   );
// };

// export default DynamicFormBuilder;

import React from 'react';
import { Plus, Trash, X } from 'lucide-react';

const DynamicFormBuilder = ({ schema, setSchema }) => {

  const addField = () => {
    setSchema([
      ...schema,
      { label: "", type: "text", options: [] }
    ]);
  };

  const removeField = (index) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    const newSchema = [...schema];
    newSchema[index][key] = value;
    setSchema(newSchema);
  };

  // -------- MCQ OPTION LOGIC --------

  const addOption = (fieldIndex) => {
    const newSchema = [...schema];
    newSchema[fieldIndex].options.push("");
    setSchema(newSchema);
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const newSchema = [...schema];
    newSchema[fieldIndex].options[optionIndex] = value;
    setSchema(newSchema);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newSchema = [...schema];
    newSchema[fieldIndex].options.splice(optionIndex, 1);
    setSchema(newSchema);
  };

  return (
    <div
      className="mt-4 p-3 rounded-3"
      style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-primary)' }}
    >
      <h6 className="text-secondary text-uppercase mb-3">
        Registration Form Builder
      </h6>

      {schema.map((field, idx) => (
        <div
          key={idx}
          className="mb-4 p-3 rounded bg-dark border border-secondary position-relative"
        >
          {/* Delete Question */}
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
            onClick={() => removeField(idx)}
          >
            <Trash size={14} />
          </button>

          {/* Question + Type */}
          <div className="row g-2">
            <div className="col-md-7">
              <label className="small text-muted">Question</label>
              <input
                type="text"
                className="form-control bg-transparent text-white border-secondary"
                placeholder="e.g. T-Shirt Size"
                value={field.label}
                onChange={(e) =>
                  updateField(idx, 'label', e.target.value)
                }
                required
              />
            </div>

            <div className="col-md-5">
              <label className="small text-muted">Answer Type</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={field.type}
                onChange={(e) =>
                  updateField(idx, 'type', e.target.value)
                }
              >
                <option value="text">Text Input</option>
                <option value="radio">Multiple Choice (Radio)</option>
              </select>
            </div>
          </div>

          {/* -------- MCQ OPTIONS UI -------- */}
          {field.type === 'radio' && (
            <div className="mt-3">
              <label className="small text-muted mb-2 d-block">
                Options
              </label>

              {field.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <input
                    type="text"
                    className="form-control bg-transparent text-white border-secondary"
                    placeholder={`Option ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) =>
                      updateOption(idx, optIdx, e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeOption(idx, optIdx)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => addOption(idx)}
              >
                <Plus size={14} /> Add Option
              </button>

              {field.options.length < 2 && (
                <small className="text-warning d-block mt-1">
                  At least 2 options required
                </small>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary btn-sm w-100 border-dashed"
        onClick={addField}
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
};

export default DynamicFormBuilder;
