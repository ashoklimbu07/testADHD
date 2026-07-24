import { Mic, Plus } from 'lucide-react';
import { A } from '../constants';

const fabStyle = {
  position: 'absolute', right: 20, bottom: 92, width: 58, height: 58, borderRadius: '50%',
  background: A, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', boxShadow: '0 8px 20px rgba(242,145,127,.45)', zIndex: 20,
};

export default function Fabs({ micFabVisible, addFabVisible, onMic, onAdd }) {
  return (
    <>
      {micFabVisible && (
        <button onClick={onMic} style={fabStyle}>
          <Mic size={24} color="#FFFFFF" strokeWidth={2} />
        </button>
      )}
      {addFabVisible && (
        <button onClick={onAdd} style={fabStyle}>
          <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}
