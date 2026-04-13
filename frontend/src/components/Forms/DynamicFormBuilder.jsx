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
import { Plus, Trash, X, GripVertical, Type, ListChecks } from 'lucide-react';
import SearchableDropdown from '../UI/SearchableDropdown';

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
    <div className="form-builder-v3">
      <div className="fb3-header">
        <div className="fb3-header-icon">
          <ListChecks size={18} />
        </div>
        <div>
          <h6>Registration Form Builder</h6>
          <p>Add custom fields to your event registration form</p>
        </div>
      </div>

      <div className="fb3-fields">
        {schema.map((field, idx) => (
          <div key={idx} className="fb3-field-card" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="fb3-field-header">
              <div className="fb3-field-number">{idx + 1}</div>
              <span className="fb3-field-type-badge">
                {field.type === 'text' ? <><Type size={12} /> Text</> : <><ListChecks size={12} /> MCQ</>}
              </span>
              <button
                type="button"
                className="fb3-delete-btn"
                onClick={() => removeField(idx)}
              >
                <Trash size={14} />
              </button>
            </div>

            <div className="fb3-field-body">
              <div className="fb3-field-row">
                <div className="fb3-field-input-group" style={{ flex: 2 }}>
                  <label>Question</label>
                  <div className="input-wrapper-v3">
                    <input
                      type="text"
                      className="form-input-v3"
                      placeholder="e.g. T-Shirt Size"
                      value={field.label}
                      onChange={(e) => updateField(idx, 'label', e.target.value)}
                      required
                    />
                    <div className="input-focus-ring" />
                  </div>
                </div>

                <div className="fb3-field-input-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <SearchableDropdown
                    options={[
                      { label: 'Text Input', value: 'text' },
                      { label: 'Multiple Choice', value: 'radio' }
                    ]}
                    value={field.type}
                    onChange={(val) => updateField(idx, 'type', val)}
                    placeholder="Select type..."
                    searchable={false}
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {field.type === 'radio' && (
                <div className="fb3-options-section">
                  <label className="fb3-options-label">Options</label>

                  {field.options.map((opt, optIdx) => (
                    <div key={optIdx} className="fb3-option-row">
                      <div className="fb3-option-bullet">{String.fromCharCode(65 + optIdx)}</div>
                      <div className="input-wrapper-v3" style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input-v3"
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                          required
                        />
                        <div className="input-focus-ring" />
                      </div>
                      <button
                        type="button"
                        className="fb3-option-delete"
                        onClick={() => removeOption(idx, optIdx)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="fb3-add-option-btn"
                    onClick={() => addOption(idx)}
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>

                  {field.options.length < 2 && (
                    <div className="fb3-warning">
                      At least 2 options required
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="fb3-add-field-btn"
        onClick={addField}
      >
        <Plus size={18} />
        <span>Add Question</span>
      </button>
    </div>
  );
};

export default DynamicFormBuilder;
