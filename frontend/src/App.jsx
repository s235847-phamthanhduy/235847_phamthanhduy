import { useEffect, useState, useCallback } from 'react';
import './App.css';

const API = (window.__API_URL__ || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];
const STATUS_CLASS = {
  'Đang sử dụng': 'ok', 'Hư hỏng': 'bad', 'Đang sửa chữa': 'fix', 'Ngừng sử dụng': 'off',
};
const EMPTY = {
  deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '',
  quantity: 1, status: 'Đang sử dụng', purchaseDate: '', description: '',
};

async function request(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors ? ': ' + data.errors.join(', ') : '';
    throw new Error((data.message || 'Có lỗi xảy ra') + detail);
  }
  return data;
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null);      // null = đóng; object = đang thêm/sửa
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async (keyword = '') => {
    setLoading(true); setError('');
    try {
      const q = keyword ? `?search=${encodeURIComponent(keyword)}` : '';
      setDevices(await request(`/api/devices${q}`));
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ' : e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  const openAdd = () => { setEditingId(null); setForm({ ...EMPTY }); };
  const openEdit = (d) => {
    setEditingId(d._id);
    setForm({ ...d, purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : '' });
  };

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = JSON.stringify({ ...form, quantity: Number(form.quantity) });
      if (editingId) await request(`/api/devices/${editingId}`, { method: 'PUT', body });
      else await request('/api/devices', { method: 'POST', body });
      flash(editingId ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công');
      setForm(null); load(search);
    } catch (err) { setError(err.message); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Xóa thiết bị "${d.name}"?`)) return;
    try {
      await request(`/api/devices/${d._id}`, { method: 'DELETE' });
      flash('Đã xóa thiết bị'); load(search);
    } catch (err) { setError(err.message); }
  };

  const showDetail = async (id) => {
    try { setDetail(await request(`/api/devices/${id}`)); }
    catch (err) { setError(err.message); }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>

      <div className="toolbar">
        <input placeholder="Tìm theo mã, tên, loại, phòng..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)}>Tìm kiếm</button>
        <button onClick={() => { setSearch(''); load(''); }}>Xóa lọc</button>
        <button className="primary" onClick={openAdd}>+ Thêm thiết bị</button>
      </div>

      {notice && <div className="msg success">{notice}</div>}
      {error && <div className="msg error">{error}</div>}
      {loading && <p>Đang tải dữ liệu...</p>}

      <table>
        <thead>
          <tr><th>Mã</th><th>Tên</th><th>Loại</th><th>Phòng</th><th>SL</th><th>Tình trạng</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          {!loading && devices.length === 0 && <tr><td colSpan="7">Không có thiết bị nào</td></tr>}
          {devices.map((d) => (
            <tr key={d._id}>
              <td>{d.deviceId}</td><td>{d.name}</td><td>{d.deviceType}</td>
              <td>{d.room}</td><td>{d.quantity}</td>
              <td><span className={`badge ${STATUS_CLASS[d.status]}`}>{d.status}</span></td>
              <td>
                <button onClick={() => showDetail(d._id)}>Chi tiết</button>
                <button onClick={() => openEdit(d)}>Sửa</button>
                <button className="danger" onClick={() => remove(d)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết thiết bị</h2>
            <p><b>Mã:</b> {detail.deviceId}</p>
            <p><b>Tên:</b> {detail.name}</p>
            <p><b>Loại:</b> {detail.deviceType}</p>
            <p><b>Phòng:</b> {detail.room}</p>
            <p><b>Hãng:</b> {detail.brand}</p>
            <p><b>Model:</b> {detail.model}</p>
            <p><b>Số lượng:</b> {detail.quantity}</p>
            <p><b>Tình trạng:</b> <span className={`badge ${STATUS_CLASS[detail.status]}`}>{detail.status}</span></p>
            <p><b>Ngày mua:</b> {detail.purchaseDate ? new Date(detail.purchaseDate).toLocaleDateString('vi-VN') : ''}</p>
            <p><b>Mô tả:</b> {detail.description}</p>
            <button onClick={() => setDetail(null)}>Đóng</button>
          </div>
        </div>
      )}

      {form && (
        <div className="modal">
          <form className="box" onSubmit={submit}>
            <h2>{editingId ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2>
            <label>Mã thiết bị *<input name="deviceId" value={form.deviceId} onChange={change} required /></label>
            <label>Tên thiết bị *<input name="name" value={form.name} onChange={change} required /></label>
            <label>Loại thiết bị *<input name="deviceType" value={form.deviceType} onChange={change} required /></label>
            <label>Phòng học *<input name="room" value={form.room} onChange={change} required /></label>
            <label>Hãng<input name="brand" value={form.brand} onChange={change} /></label>
            <label>Model<input name="model" value={form.model} onChange={change} /></label>
            <label>Số lượng *<input type="number" min="0" name="quantity" value={form.quantity} onChange={change} required /></label>
            <label>Tình trạng
              <select name="status" value={form.status} onChange={change}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Ngày mua<input type="date" name="purchaseDate" value={form.purchaseDate} onChange={change} /></label>
            <label>Mô tả<textarea name="description" value={form.description} onChange={change} /></label>
            {error && <div className="msg error">{error}</div>}
            <div>
              <button type="submit" className="primary">Lưu</button>
              <button type="button" onClick={() => { setForm(null); setError(''); }}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}