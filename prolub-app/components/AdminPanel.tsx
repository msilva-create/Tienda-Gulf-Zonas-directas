import React, { useState, useEffect } from 'react';
import { Database, Client, ClientPoints, Reward } from '../types';
import { getDatabase, saveDatabase, resetDatabase } from '../services/db';
import { Save, RefreshCw, Plus, Trash2, RotateCcw, Mail, Download } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [db, setDb] = useState<Database>(getDatabase());
  const [activeTab, setActiveTab] = useState<'clients' | 'points' | 'rewards' | 'orders'>('clients');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setDb(getDatabase());
  }, []);

  const handleSave = () => {
    saveDatabase(db);
    alert('Base de datos actualizada correctamente.');
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro? Esto borrará todos los cambios actuales y restaurará los datos originales definidos en el archivo de código (db.ts).')) {
      const freshDb = resetDatabase();
      setDb(freshDb);
      alert('Base de datos restaurada a los valores originales.');
    }
  };

  const handleTestEmail = async () => {
    setSendingEmail(true);
    try {
        // Configuration must match App.tsx
        const SERVICE_ID = 'service_hdlsj5r';
        const TEMPLATE_ID = 'template_rrqgdym';
        const PUBLIC_KEY = 'pfbP31YCRZ3dzBat5';
        
        const adminEmails = "asismercadeo@gulfcolombia.com,trademarketing@prolub.com.co";

        emailjs.init(PUBLIC_KEY);

        const templateParams = {
            to_email: adminEmails,
            to_name: 'Administrador (Prueba)',
            from_name: 'Sistema de Prueba',
            from_email: 'noreply@rewards.com', 
            subject: 'PRUEBA DE SISTEMA - Prolub Gulf Rewards',
            
            // Variables matching App.tsx to ensure template compatibility
            Premio: "- 1x Prueba de Producto (100 pts)",
            "Nombre del receptor": "Usuario de Prueba",
            Cantidad: 1,
            "Dirección": "Dirección de Prueba 123",
            Telefono: "3000000000",
            Ciudad: "Ciudad de Prueba",
            "Puntos gastados": 100,

            // Fallbacks
            message: "Esta es una prueba de verificación de correo generada desde el panel administrativo.",
            notes: "Si recibes esto, la configuración de EmailJS es correcta y los canjes deberían llegar a este correo.",
            email: adminEmails, 
            customer_name: "Admin Tester",
            customer_id: "TEST-001",
        };
        
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

        if (response.status === 200) {
           alert(`Correo de prueba enviado exitosamente a: ${adminEmails}`);
        } else {
           throw new Error(`Status ${response.status}: ${response.text}`);
        }

    } catch (error: any) {
        let errorMsg = 'Unknown error';
        if (error instanceof Error) errorMsg = error.message;
        else if (typeof error === 'object' && error?.text) errorMsg = error.text;
        else errorMsg = String(error);

        console.error('Email Test Failed:', errorMsg);
        alert(`Error al enviar correo de prueba: ${errorMsg}`);
    } finally {
        setSendingEmail(false);
    }
  };

  const updateField = (section: keyof Database, index: number, field: string, value: any) => {
    const newData = { ...db };
    // @ts-ignore
    newData[section][index][field] = value;
    setDb(newData);
  };

  // Special handler for splitting string input back to array for image URLs
  const updateRewardImages = (index: number, value: string) => {
      const newData = { ...db };
      const urls = value.split(',').map(u => u.trim()).filter(u => u.length > 0);
      newData.rewards[index].imageUrls = urls;
      setDb(newData);
  };

  const deleteRow = (section: keyof Database, index: number) => {
    const newData = { ...db };
    // @ts-ignore
    newData[section].splice(index, 1);
    setDb(newData);
  };

  const addRow = (section: keyof Database) => {
    const newData = { ...db };
    if (section === 'clients') {
      newData.clients.push({ id: Date.now().toString(), businessId: '0000', pointOfSale: 'Nuevo POS', password: 'gulf', type: 'Normal' });
    } else if (section === 'points') {
      newData.points.push({ pointOfSale: 'Nuevo POS', points: 0 });
    } else if (section === 'rewards') {
      newData.rewards.push({
        id: Date.now().toString(),
        name: 'Nuevo Premio',
        description: 'Descripción',
        pointsPareto: 0,
        pointsNormal: 0,
        imageUrls: ['https://placehold.co/600x400/003594/FFFFFF?text=Imagen']
      });
    }
    setDb(newData);
  };

  const exportOrdersToCSV = () => {
      const headers = ['Fecha', 'Hora', 'Cliente', 'Receptor', 'Ciudad', 'Dirección', 'Teléfono', 'Productos'];
      const rows = db.orders.map(o => [
          o.date,
          o.time,
          o.client,
          o.receiver,
          o.city,
          o.address,
          o.phone,
          o.items.replace(/\n/g, ' | ') // Ensure items stay in one cell
      ]);

      const csvContent = [
          headers.join(','),
          ...rows.map(r => r.map(c => `"${c}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Pedidos_Gulf_Prolub_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-gulf-blue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-sports text-gulf-blue">Panel de Administración</h2>
        <div className="flex items-center space-x-4">
            <button 
                onClick={handleTestEmail} 
                disabled={sendingEmail}
                className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center transition-colors disabled:opacity-50"
            >
              <Mail size={16} className="mr-1" /> 
              {sendingEmail ? 'Enviando...' : 'Probar Email'}
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-600 flex items-center transition-colors">
              <RotateCcw size={16} className="mr-1" /> Restaurar
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={onLogout} className="text-sm text-red-500 hover:underline">Salir</button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b pb-2">
        {(['clients', 'points', 'rewards', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold uppercase ${activeTab === tab ? 'bg-gulf-orange text-white rounded' : 'text-gray-500'}`}
          >
            {tab === 'clients' ? 'Clientes' : tab === 'points' ? 'Puntos' : tab === 'rewards' ? 'Premios' : 'Pedidos (Logística)'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto bg-gray-50 p-4 rounded border">
        <table className="min-w-full text-sm">
          <thead>
            {activeTab === 'clients' && (
              <tr>
                <th className="p-2 text-left">ID (Usuario)</th>
                <th className="p-2 text-left">POS</th>
                <th className="p-2 text-left">Password</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2">Acción</th>
              </tr>
            )}
            {activeTab === 'points' && (
              <tr>
                <th className="p-2 text-left">POS</th>
                <th className="p-2 text-left">Puntos Disponibles</th>
                <th className="p-2">Acción</th>
              </tr>
            )}
            {activeTab === 'rewards' && (
              <tr>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">URLs de Imagen</th>
                <th className="p-2 text-left">Pareto Pts</th>
                <th className="p-2 text-left">Normal Pts</th>
                <th className="p-2">Acción</th>
              </tr>
            )}
            {activeTab === 'orders' && (
              <tr>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Hora</th>
                <th className="p-2 text-left">Cliente</th>
                <th className="p-2 text-left">Receptor</th>
                <th className="p-2 text-left">Ciudad</th>
                <th className="p-2 text-left">Dirección</th>
                <th className="p-2 text-left">Teléfono</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'clients' && db.clients.map((client, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2"><input value={client.businessId} onChange={(e) => updateField('clients', idx, 'businessId', e.target.value)} className="w-full border p-1 rounded" /></td>
                <td className="p-2"><input value={client.pointOfSale} onChange={(e) => updateField('clients', idx, 'pointOfSale', e.target.value)} className="w-full border p-1 rounded" /></td>
                <td className="p-2"><input value={client.password} onChange={(e) => updateField('clients', idx, 'password', e.target.value)} className="w-full border p-1 rounded" /></td>
                <td className="p-2">
                  <select value={client.type} onChange={(e) => updateField('clients', idx, 'type', e.target.value)} className="w-full border p-1 rounded">
                    <option value="Pareto">Pareto</option>
                    <option value="Normal">Normal</option>
                  </select>
                </td>
                <td className="p-2 text-center"><button onClick={() => deleteRow('clients', idx)} className="text-red-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
            {activeTab === 'points' && db.points.map((p, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2"><input value={p.pointOfSale} onChange={(e) => updateField('points', idx, 'pointOfSale', e.target.value)} className="w-full border p-1 rounded" /></td>
                <td className="p-2"><input type="number" value={p.points} onChange={(e) => updateField('points', idx, 'points', parseInt(e.target.value))} className="w-full border p-1 rounded" /></td>
                <td className="p-2 text-center"><button onClick={() => deleteRow('points', idx)} className="text-red-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
            {activeTab === 'rewards' && db.rewards.map((r, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2"><input value={r.name} onChange={(e) => updateField('rewards', idx, 'name', e.target.value)} className="w-full border p-1 rounded" /></td>
                <td className="p-2">
                    <textarea 
                        value={r.imageUrls.join(', ')} 
                        onChange={(e) => updateRewardImages(idx, e.target.value)} 
                        className="w-full border p-1 rounded text-xs h-16"
                        placeholder="url1, url2..."
                    />
                </td>
                <td className="p-2"><input type="number" value={r.pointsPareto} onChange={(e) => updateField('rewards', idx, 'pointsPareto', parseInt(e.target.value))} className="w-20 border p-1 rounded" /></td>
                <td className="p-2"><input type="number" value={r.pointsNormal} onChange={(e) => updateField('rewards', idx, 'pointsNormal', parseInt(e.target.value))} className="w-20 border p-1 rounded" /></td>
                <td className="p-2 text-center"><button onClick={() => deleteRow('rewards', idx)} className="text-red-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
            {activeTab === 'orders' && db.orders && db.orders.map((o, idx) => (
              <tr key={idx} className="border-b text-xs">
                 <td className="p-2">{o.date}</td>
                 <td className="p-2">{o.time}</td>
                 <td className="p-2 font-bold">{o.client}</td>
                 <td className="p-2">{o.receiver}</td>
                 <td className="p-2">{o.city}</td>
                 <td className="p-2">{o.address}</td>
                 <td className="p-2">{o.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <button onClick={() => activeTab !== 'orders' && addRow(activeTab)} className={`flex items-center text-gulf-blue hover:text-gulf-orange ${activeTab === 'orders' ? 'opacity-0 pointer-events-none' : ''}`}>
          <Plus size={18} className="mr-1" /> Agregar Fila
        </button>

        <div className="flex gap-4">
             {activeTab === 'orders' && (
                 <button onClick={exportOrdersToCSV} className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                    <Download size={18} className="mr-2" /> Exportar CSV
                 </button>
             )}
             
             {activeTab !== 'orders' && (
                <button onClick={handleSave} className="flex items-center bg-gulf-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-gulf-orange transition-colors">
                  <Save size={18} className="mr-2" /> Guardar Cambios
                </button>
             )}
        </div>
      </div>
    </div>
  );
};