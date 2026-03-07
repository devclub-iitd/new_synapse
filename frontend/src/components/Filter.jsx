// import React from 'react';
// import { X } from 'lucide-react';

// const BOARD_CLUB_MAPPING = {
//   "CAIC": ["DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing", "PAC", "BnC", "Aeromodelling Club", "Economics Club", "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"],
//   "BRCA": ["Drama", "Design", "PFC", "FACC", "Dance", "Hindi Samiti", "Literary", "DebSoc", "QC", "Music", "Spic Macay", "Envogue"],
// };

// const FilterDrawer = ({ 
//   isOpen, 
//   onClose, 
//   selectedBoard, 
//   setSelectedBoard, 
//   selectedClub, 
//   setSelectedClub 
// }) => {
//   return (
//     <>
//       {/* Background Blur Overlay */}
//       {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

//       {/* Sliding Sidebar */}
//       <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
//         <div className="d-flex justify-content-between align-items-center mb-4 p-3 border-bottom border-secondary">
//           <h5 className="mb-0 fw-bold text-white">Filter Events</h5>
//           <button className="btn text-white" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-4">
//           <div className="mb-4">
//             <label className="form-label text-secondary small text-uppercase fw-bold mb-3">By Board</label>
//             <div className="filter-options">
//               {Object.keys(BOARD_CLUB_MAPPING).map(board => (
//                 <button 
//                   key={board}
//                   className={`filter-chip ${selectedBoard === board ? 'active' : ''}`}
//                   onClick={() => { setSelectedBoard(board); setSelectedClub(""); }}
//                 >
//                   {board}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {selectedBoard && (
//             <div className="mb-4">
//               <label className="form-label text-secondary small text-uppercase fw-bold mb-3">By Club</label>
//               <div className="filter-options">
//                 {BOARD_CLUB_MAPPING[selectedBoard].map(club => (
//                   <button 
//                     key={club}
//                     className={`filter-chip ${selectedClub === club ? 'active' : ''}`}
//                     onClick={() => setSelectedClub(club)}
//                   >
//                     {club}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="mt-5 pt-4 border-top border-secondary">
//             <button className="btn btn-purple w-100 mb-2" onClick={onClose}>Apply Filters</button>
//             <button 
//               className="btn btn-link w-100 text-secondary text-decoration-none" 
//               onClick={() => { setSelectedBoard(""); setSelectedClub(""); }}
//             >
//               Reset All
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FilterDrawer;

import React from 'react';
import { X } from 'lucide-react';

const ORG_TYPES = ["Clubs", "Fests", "Departments"];

const BOARD_CLUB_MAPPING = {
  "CAIC": ["DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing", "PAC", "BnC", "Aeromodelling Club", "Economics Club", "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"],
  "BRCA": ["Drama", "Design", "PFC", "FACC", "Dance", "Hindi Samiti", "Literary", "DebSoc", "QC", "Music", "Spic Macay", "Envogue"],
};

const FESTS = ["Rendezvous", "Tryst", "Springfest"];
const DEPARTMENTS = ["Computer Science", "Electrical", "Mechanical", "Civil", "Chemical", "Physics", "Mathematics", "Humanities"];

const FilterDrawer = ({
  isOpen,
  onClose,
  orgType,
  setOrgType,
  selectedBoard,
  setSelectedBoard,
  selectedItem,
  setSelectedItem,
}) => {

  const handleOrgTypeSelect = (type) => {
    setOrgType(type === orgType ? "" : type);
    setSelectedBoard("");
    setSelectedItem("");
  };

  const handleBoardSelect = (board) => {
    setSelectedBoard(board === selectedBoard ? "" : board);
    setSelectedItem("");
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item === selectedItem ? "" : item);
  };

  const handleReset = () => {
    setOrgType("");
    setSelectedBoard("");
    setSelectedItem("");
  };

  const isFiltered = orgType || selectedBoard || selectedItem;

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sliding Drawer */}
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'var(--border-primary)' }}>
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
            Filter Events
          </h5>
          <button
            style={{
              background: 'var(--bg-input)', border: 'none',
              borderRadius: '8px', padding: '6px 8px',
              color: 'var(--text-secondary)', cursor: 'pointer'
            }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4" style={{ overflowY: 'auto', height: 'calc(100% - 130px)' }}>

          {/* Org Type */}
          <div className="mb-4">
            <label className="form-label-modern mb-3">Category</label>
            <div className="filter-options">
              {ORG_TYPES.map(type => (
                <button
                  key={type}
                  className={`filter-chip ${orgType === type ? 'active' : ''}`}
                  onClick={() => handleOrgTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Board filter — only shown when Clubs is selected */}
          {orgType === "Clubs" && (
            <div className="mb-4">
              <label className="form-label-modern mb-3">Board</label>
              <div className="filter-options">
                {Object.keys(BOARD_CLUB_MAPPING).map(board => (
                  <button
                    key={board}
                    className={`filter-chip ${selectedBoard === board ? 'active' : ''}`}
                    onClick={() => handleBoardSelect(board)}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Club filter — shown when a board is selected */}
          {orgType === "Clubs" && selectedBoard && (
            <div className="mb-4">
              <label className="form-label-modern mb-3">Club</label>
              <div className="filter-options">
                {BOARD_CLUB_MAPPING[selectedBoard].map(club => (
                  <button
                    key={club}
                    className={`filter-chip ${selectedItem === club ? 'active' : ''}`}
                    onClick={() => handleItemSelect(club)}
                  >
                    {club}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fest filter */}
          {orgType === "Fests" && (
            <div className="mb-4">
              <label className="form-label-modern mb-3">Fest</label>
              <div className="filter-options">
                {FESTS.map(fest => (
                  <button
                    key={fest}
                    className={`filter-chip ${selectedItem === fest ? 'active' : ''}`}
                    onClick={() => handleItemSelect(fest)}
                  >
                    {fest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Department filter */}
          {orgType === "Departments" && (
            <div className="mb-4">
              <label className="form-label-modern mb-3">Department</label>
              <div className="filter-options">
                {DEPARTMENTS.map(dept => (
                  <button
                    key={dept}
                    className={`filter-chip ${selectedItem === dept ? 'active' : ''}`}
                    onClick={() => handleItemSelect(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-top" style={{ borderColor: 'var(--border-primary)' }}>
          <button className="btn btn-purple w-100 mb-2" onClick={onClose}>
            Apply Filters
          </button>
          {isFiltered && (
            <button
              className="btn w-100"
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
              onClick={handleReset}
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;