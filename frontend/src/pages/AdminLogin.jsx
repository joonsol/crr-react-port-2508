// src/pages/AdminLogin.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api'; // baseURL + withCredentials: true


const AdminLogin = () => {
  const nav = useNavigate();


  // 로그인 유지 체크 상태
  const [checking, setChecking] = useState(true);

  // 폼 상태
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // { message, remainingAttempts } 형태로 통일
  const hadleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/api/auth/login', formData, {
        withCredentials: true
      })
      if (response.data.user) {
        nav("/admin/posts")
      }
    } catch (error) {
      const errorMessage = error.response.data.message || "로그인에 실패"
      const remainingAttempts = error.response.data.remainingAttempts;

      setError({
        message: errorMessage,
        remainingAttempts: remainingAttempts
      })
    }
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
              onChange={hadleChange}
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
              onChange={hadleChange}
            />
          </div>
        </div>
        {error && (
          <div className='error-box'>
            {typeof error === "string" ? error : error.message}
            {error.remaingAttempts != undefined && (
              <div className='retry-count'>
                남은 시도 횟수:{error.remaingAttempts}회
              </div>
            )}
          </div>
        )}

        <button type="submit" className="login-button">
          로그인
        </button>
      </form>
    </div>
  );

}

export default AdminLogin