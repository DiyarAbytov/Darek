import React, { useEffect, useMemo, useState } from "react";
import "./Profile.scss";
import { getMe } from "../../Api/Api";

const normalize = (d) => ({
  username: d?.username || "",
  email: d?.email || "",
  first_name: d?.first_name || "",
  last_name: d?.last_name || "",
  phone: d?.phone || "",
  role: d?.role || "",
  avatar: d?.avatar ? `https://dar.kg${d.avatar}` : "",
});

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    avatar: "",
  });
  const [error, setError] = useState("");

  const initials = useMemo(() => {
    const f = profile.first_name?.[0] || "";
    const l = profile.last_name?.[0] || "";
    const v = (f + l || "U").toUpperCase();
    return v || "U";
  }, [profile.first_name, profile.last_name]);

  const load = async () => {
    try {
      const { data } = await getMe();
      setProfile(normalize(data));
      setError("");
    } catch (e) {
      console.error(e?.message || "Profile load error");
      setError("Ошибка загрузки профиля");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="profile">
      <div className="profile__container">
        <h2 className="profile__title">Ваш профиль</h2>

        {error ? <div className="profile__banner profile__banner--error">{error}</div> : null}

        <article className="profile__article">
          <div className="profile__header">
            <div className="profile__avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="profile__avatar_image" />
              ) : (
                <div className="profile__avatar_initial">{initials}</div>
              )}
            </div>
            <div className="profile__header_info">
              <h3 className="profile__name">
                {profile.first_name || profile.last_name
                  ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                  : "Без имени"}
              </h3>
              <p className="profile__role">
                {profile.role ? (profile.role === "realtor" ? "Агент по недвижимости" : "Админ") : "Роль не указана"}
              </p>
            </div>
          </div>

          <h4 className="profile__subtitle">Информация о профиле</h4>
          <div className="profile__info">
            <div className="profile__field">
              <span className="profile__label">Имя пользователя</span>
              <span className="profile__value">{profile.username || "Не указано"}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Email</span>
              <span className="profile__value">{profile.email || "Не указано"}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Телефон</span>
              <span className="profile__value">{profile.phone || "Не указано"}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Profile;
