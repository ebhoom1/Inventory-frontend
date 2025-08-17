import './App.css';
import Login from './Components/Login/Login';
import { Routes, Route } from 'react-router-dom';
import Water from './Components/WaterDashboard/Water';
import AddParameter from './Components/Parameter/AddParameter';
import Calibration from './Components/Calibration/AddCalibration';
import ViewCalibration from './Components/Calibration/ViewCalibration';
import Download from './Components/Download';
import Account from './Components/Account/Account';
import ResetLink from './Components/Login/ResetLink'
import SetPassword from './Components/Login/SetPassword';
import ManageUser from './Components/ManageUser/ManageUser';
import ValidateReport from './Components/Report/ValidateReport';
import CheckAndValidate from './Components/Report/CheckAndValidate';
import Dashboard from './Components/Dashboard/Dashboard';
import ViewReport from './Components/Report/ViewReport';
import Chat from './Components/Chat/Chat';
import InventoryLayout from './Components/Inventory/InventoryLayout';
import ServiceLayout from './Components/Services/ServiceLayout';
import EquipmentLayout from './Components/Equipment/EquipmentLayout';
import Attendence from './Components/Attendence/Attendence';
import PreviousAttendence from './Components/Attendence/PreviousAttendence';
import EditUser from './Components/ManageUser/EditUser';
import ViewUser from './Components/ManageUser/ViewUser';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path='/reset' element={<ResetLink/>}></Route>
      <Route path='/setpassword' element={<SetPassword/>}></Route>

      


            <Route path="/water" element={<Dashboard />} />
            <Route path="/addparameter" element={<AddParameter />} />
            <Route path="/addcalibration" element={<Calibration />} />
            <Route path="/viewcalibration" element={<ViewCalibration />} />
            <Route path="/download" element={<Download/>} />
            <Route path="/chat" element={<Chat/>} />
            <Route path="/account" element={<Account/>} />
            <Route path="/manageuser" element={<ManageUser/>} />
            <Route path="/edit-user/:id" element={<EditUser />} />
            <Route path="/view-user/:id" element={<ViewUser />} />
            <Route path="/validatereport" element={<ValidateReport/>} />
            <Route path="/checkandvalidate" element={<CheckAndValidate/>} />
            <Route path="/view-report" element={<ViewReport/>} />
            <Route path="/inventory" element={<InventoryLayout/>} />
            <Route path="/services" element={<ServiceLayout/>} />
            <Route path="/equipment" element={<EquipmentLayout/>} />
            <Route path="/attendence" element={<Attendence/>} />
            <Route path="/previous-attendence" element={<PreviousAttendence/>} />







    </Routes>
  );
}

export default App;
