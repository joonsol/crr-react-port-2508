// src/pages/AdminLogin.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api'; // baseURL + withCredentials: true

const AdminLogin = () => {
  const nav = useNavigate();

  // 로그인 유지 체크 상태
  const [checking, setChecking] = useState(true);

  // 폼 상태
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // { message, remainingAttempts } 형태로 통일

  // ✅ 마운트 시 /me 요청 → 이미 로그인이면 /admin/posts로 이동
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (!alive) return;
        if (data?.user) {
          nav('/admin/posts', { replace: true });
        }
      } catch {
        // 미로그인: 로그인 화면 유지
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [nav]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/auth/login', formData); // ✅ api 인스턴스 사용
      if (data?.user) {
        nav('/admin/posts', { replace: true });
      } else {
        setError({ message: '로그인 응답이 올바르지 않습니다.' });
      }
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;
      const message =
        (typeof resp === 'string' && resp) ||
        resp?.message ||
        (status === 401 ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '로그인에 실패했습니다.');
      const remainingAttempts = resp?.remainingAttempts;
      setError({ message, remainingAttempts });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return <div style={{ padding: 24 }}>로그인 상태 확인 중…</div>;
  }

  return (
    <div>
      <div className="login-header">
        <h3>관리자 로그인</h3>
        <p>관리자 전용 페이지입니다.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-field">
            <label htmlFor="username">관리자 아이디</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="관리자 아이디"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">관리자 비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="관리자 비밀번호"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
        </div>

        {error && (
          <div className="error-box">
            {error.message}
            {typeof error.remainingAttempts === 'number' && (
              <div className="retry-count">
                남은 시도 횟수: {error.remainingAttempts}회
              </div>
            )}
          </div>
        )}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
