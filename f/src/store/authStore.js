import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  isRegistering: false,

  register: async (name, email, password) => {
    try {
      isRegistering = true;
      const res = await api.post(
        "/user/register",
        { name, email, password },
        { withCredentials: true }
      );
      if (res.data.message === "User registered successfully") {
        set({ user: res.data.user });
      }
    } catch (error) {
      console.log(error);
    } finally {
      isRegistering = false;
    }
  },
}));

export default useAuthStore;
