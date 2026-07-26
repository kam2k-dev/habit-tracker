export type Language = 'id' | 'en';

export interface Translations {
  nav: {
    title: string;
    activeHabits: string;
    profile: string;
    darkMode: string;
    lightMode: string;
    deleteAll: string;
    logout: string;
    signInSignUp: string;
    language: string;
    indonesian: string;
    english: string;
  };
  tabs: {
    today: string;
    good: string;
    bad: string;
    stats: string;
  };
  hero: {
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    noHabits: string;
    allDone: string;
    progressText: string;
    activeStreak: string;
    days: string;
    completionRate: string;
  };
  habitCard: {
    done: string;
    undone: string;
    streak: string;
    totalDone: string;
    target: string;
    timesPerDay: string;
    addNote: string;
    editNote: string;
    notePlaceholder: string;
    editHabit: string;
    deleteHabit: string;
    confirmDelete: string;
    confirmDeleteDesc: string;
    cancel: string;
    delete: string;
    save: string;
    badHabitAvoided: string;
    badHabitDone: string;
    times: string;
  };
  addHabit: {
    addTitle: string;
    editTitle: string;
    habitNameLabel: string;
    habitNamePlaceholder: string;
    typeLabel: string;
    goodType: string;
    goodTypeDesc: string;
    badType: string;
    badTypeDesc: string;
    categoryLabel: string;
    targetLabel: string;
    timesPerDay: string;
    iconLabel: string;
    colorLabel: string;
    saveButton: string;
    updateButton: string;
    cancelButton: string;
  };
  stats: {
    title: string;
    subtitle: string;
    totalHabits: string;
    completionRate: string;
    activeStreak: string;
    bestStreak: string;
    activityHeatmap: string;
    activityChart: string;
    performanceSummary: string;
    less: string;
    more: string;
    goodVsBad: string;
    goodHabits: string;
    badHabits: string;
    weeklyProgress: string;
    last30DaysSummary: string;
    positiveTrend: string;
    needsAttention: string;
    overallAverage: string;
    streakDetails: string;
    streakRecordDesc: string;
    highestStreak: string;
    noActiveStreak: string;
    good: string;
    bad: string;
    empty: string;
  };
  dateSelector: {
    today: string;
    yesterday: string;
    selectDate: string;
  };
  dayDetail: {
    title: string;
    date: string;
    habitsCompleted: string;
    noActivity: string;
    notes: string;
    close: string;
  };
  emptyState: {
    title: string;
    description: string;
    actionButton: string;
    noGoodHabits: string;
    noBadHabits: string;
    clickPlusHint: string;
    toCreateGood: string;
    toCreateBad: string;
    goodBanner: string;
    badBanner: string;
  };
  templates: {
    morningRoutine: {
      name: string;
      habits: string[];
    };
    fitness: {
      name: string;
      habits: string[];
    };
    reading: {
      name: string;
      habits: string[];
    };
    templateAdded: string;
    habitsAddedCount: string;
  };
  allDone: {
    title: string;
    subtitle: string;
    quote: string;
  };
  login: {
    title: string;
    subtitle: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    passwordMinPlaceholder: string;
    forgotPassword: string;
    enterDashboard: string;
    orOtherOptions: string;
    signInWith: string;
    signInGoogle: string;
    newHere: string;
    createNewAccount: string;
    alreadyHaveAccount: string;
    signInLink: string;
    createAccountNow: string;
    sendResetInstructions: string;
    back: string;
    tryGuest: string;
    guestNotice: string;
    features: {
      streakTitle: string;
      streakDesc: string;
      privacyTitle: string;
      privacyDesc: string;
      statsTitle: string;
      statsDesc: string;
    };
  };
  profile: {
    title: string;
    subtitle: string;
    changeAvatar: string;
    customUrl: string;
    orSelectPreset: string;
    removeAvatar: string;
    save: string;
    close: string;
  };
  toast: {
    habitAdded: string;
    habitUpdated: string;
    habitDeleted: string;
    allDeleted: string;
    streakReset: string;
    languageChanged: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    nav: {
      title: 'Habit Tracker',
      activeHabits: 'kebiasaan aktif',
      profile: 'Profil Saya',
      darkMode: 'Mode Gelap',
      lightMode: 'Mode Terang',
      deleteAll: 'Hapus Semua Kebiasaan',
      logout: 'Keluar',
      signInSignUp: 'Masuk / Daftar',
      language: 'Bahasa',
      indonesian: 'Bahasa Indonesia',
      english: 'English',
    },
    tabs: {
      today: 'Hari Ini',
      good: 'Baik',
      bad: 'Buruk',
      stats: 'Stats',
    },
    hero: {
      goodMorning: 'Selamat Pagi',
      goodAfternoon: 'Selamat Siang',
      goodEvening: 'Selamat Malam',
      noHabits: 'Belum ada kebiasaan yang ditambahkan.',
      allDone: 'Luar biasa! Semua habit selesai 🏆',
      progressText: 'Yuk, buat perubahan kecil hari ini. {completed}/{total} selesai.',
      activeStreak: 'Streak Aktif',
      days: 'hari',
      completionRate: 'Penyelesaian',
    },
    habitCard: {
      done: 'Selesai',
      undone: 'Belum',
      streak: 'Streak',
      totalDone: 'Total Selesai',
      target: 'Target',
      timesPerDay: 'x / hari',
      addNote: 'Tambah Catatan',
      editNote: 'Edit Catatan',
      notePlaceholder: 'Tulis catatan harian untuk kebiasaan ini...',
      editHabit: 'Edit Kebiasaan',
      deleteHabit: 'Hapus Kebiasaan',
      confirmDelete: 'Hapus Kebiasaan Ini?',
      confirmDeleteDesc: 'Tindakan ini tidak dapat dibatalkan. Riwayat kebiasaan ini akan dihapus permanen.',
      cancel: 'Batal',
      delete: 'Hapus',
      save: 'Simpan',
      badHabitAvoided: 'Berhasil Dihindari',
      badHabitDone: 'Terjadi',
      times: 'kali',
    },
    addHabit: {
      addTitle: 'Tambah Kebiasaan Baru',
      editTitle: 'Edit Kebiasaan',
      habitNameLabel: 'Nama Kebiasaan',
      habitNamePlaceholder: 'Misal: Minum Air 2L, Meditasi, Baca Buku...',
      typeLabel: 'Jenis Kebiasaan',
      goodType: 'Kebiasaan Baik',
      goodTypeDesc: 'Kebiasaan positif yang ingin kamu bangun',
      badType: 'Kebiasaan Buruk',
      badTypeDesc: 'Kebiasaan yang ingin kamu hilangkan/kurangi',
      categoryLabel: 'Kategori',
      targetLabel: 'Target Harian (Frekuensi)',
      timesPerDay: 'kali per hari',
      iconLabel: 'Pilih Ikon',
      colorLabel: 'Pilih Warna',
      saveButton: 'Tambah Kebiasaan',
      updateButton: 'Simpan Perubahan',
      cancelButton: 'Batal',
    },
    stats: {
      title: 'Statistik & Progres',
      subtitle: 'Pantau konsistensi dan pencapaian kebiasaan kamu',
      totalHabits: 'Total Habit',
      completionRate: 'Rate Penyelesaian',
      activeStreak: 'Streak Aktif',
      bestStreak: 'Streak Tertinggi',
      activityHeatmap: 'Kalender Aktivitas 365 Hari',
      activityChart: 'Grafik Aktivitas',
      performanceSummary: 'Ringkasan Performa',
      less: 'Sedikit',
      more: 'Banyak',
      goodVsBad: 'Kebiasaan Baik vs Buruk',
      goodHabits: 'Habit Baik',
      badHabits: 'Habit Buruk',
      weeklyProgress: 'Progres Mingguan',
      last30DaysSummary: 'Ringkasan performa 30 hari terakhir',
      positiveTrend: 'Trend Positif',
      needsAttention: 'Perlu Perhatian',
      overallAverage: 'Rata-rata Keseluruhan',
      streakDetails: 'Detail Streak',
      streakRecordDesc: 'Rekor konsistensi kebiasaanmu',
      highestStreak: 'Streak Tertinggi',
      noActiveStreak: 'Belum ada streak aktif',
      good: 'baik',
      bad: 'buruk',
      empty: 'kosong',
    },
    dateSelector: {
      today: 'Hari Ini',
      yesterday: 'Kemarin',
      selectDate: 'Pilih Tanggal',
    },
    dayDetail: {
      title: 'Detail Aktivitas',
      date: 'Tanggal',
      habitsCompleted: 'Kebiasaan Selesai',
      noActivity: 'Tidak ada aktivitas tercatat pada tanggal ini.',
      notes: 'Catatan Harian',
      close: 'Tutup',
    },
    emptyState: {
      title: 'Belum Ada Kebiasaan',
      description: 'Mulai bangun rutinitas positifmu hari ini. Buat kebiasaan pertama kamu sekarang!',
      actionButton: 'Buat Kebiasaan Pertama',
      noGoodHabits: 'Belum ada kebiasaan baik',
      noBadHabits: 'Belum ada kebiasaan buruk',
      clickPlusHint: 'Klik tombol + di navbar bawah',
      toCreateGood: 'untuk membuat kebiasaan baik baru.',
      toCreateBad: 'untuk membuat kebiasaan buruk baru.',
      goodBanner: 'Kebiasaan baik membantumu tumbuh dan berkembang. Tetap konsisten!',
      badBanner: 'Lacak kebiasaan buruk untuk menyadari pola dan menguranginya.',
    },
    templates: {
      morningRoutine: {
        name: 'Rutinitas Pagi',
        habits: ['Minum 2 gelas air', 'Meditasi 5 menit', 'Stretching ringan'],
      },
      fitness: {
        name: 'Kebugaran',
        habits: ['Jogging 30 menit', '50 Push-up', 'Minum protein shake'],
      },
      reading: {
        name: 'Membaca',
        habits: ['Baca 10 halaman', 'Catat quotes favorit', 'Review apa yang dibaca'],
      },
      templateAdded: 'Template {name} ditambahkan!',
      habitsAddedCount: '{count} kebiasaan telah ditambahkan.',
    },
    allDone: {
      title: 'Semua Kebiasaan Selesai! 🎉',
      subtitle: 'Kamu telah menyelesaikan semua target hari ini. Pertahankan konsistensimu!',
      quote: '"Kita adalah apa yang kita kerjakan berulang kali. Keunggulan bukan suatu tindakan, melainkan suatu kebiasaan." – Aristoteles',
    },
    login: {
      title: 'Bangun Kebiasaan Baik, Capai Impianmu',
      subtitle: 'Habit Tracker interaktif untuk melacak rutinitas positif & menghentikan kebiasaan buruk.',
      loginTitle: 'Masuk ke Akun',
      loginSubtitle: 'Masuk untuk melanjutkan tracking kebiasaanmu.',
      registerTitle: 'Daftar Akun Baru',
      registerSubtitle: 'Buat akun supaya data kebiasaanmu tersimpan.',
      forgotTitle: 'Recovery Password',
      forgotSubtitle: 'Masukkan email akun untuk menerima link reset password.',
      fullNamePlaceholder: 'Nama lengkap',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      passwordMinPlaceholder: 'Password minimal 6 karakter',
      forgotPassword: 'Lupa password?',
      enterDashboard: 'Masuk ke Dashboard',
      orOtherOptions: 'Opsi lainnya',
      signInWith: 'Masuk dengan',
      signInGoogle: 'Lanjutkan dengan Google',
      newHere: 'Baru di sini?',
      createNewAccount: 'Buat akun baru',
      alreadyHaveAccount: 'Sudah punya akun?',
      signInLink: 'Masuk ke akun',
      createAccountNow: 'Buat Akun Sekarang',
      sendResetInstructions: 'Kirim Instruksi Reset',
      back: 'Kembali',
      tryGuest: 'Coba Mode Tamu (Tanpa Akun)',
      guestNotice: 'Mode Tamu menyimpan data kamu di browser lokal.',
      features: {
        streakTitle: 'Pelacakan Streak 21 Hari',
        streakDesc: 'Bentuk kebiasaan permanen dengan sistem visualisasi progres harian.',
        privacyTitle: 'Privasi Terjamin',
        privacyDesc: 'Data kamu aman tersimpan di cloud atau lokal sesuai pilihanmu.',
        statsTitle: 'Analisis & Heatmap',
        statsDesc: 'Visualisasikan konsistensi kamu dengan kalender kontribusi bergaya GitHub.',
      },
    },
    profile: {
      title: 'Profil Pengguna',
      subtitle: 'Atur foto profil dan identitas akun kamu',
      changeAvatar: 'Ubah Avatar',
      customUrl: 'URL Gambar Kustom',
      orSelectPreset: 'Atau pilih avatar default:',
      removeAvatar: 'Hapus Avatar Kustom',
      save: 'Simpan',
      close: 'Batal',
    },
    toast: {
      habitAdded: 'Kebiasaan baru berhasil ditambahkan!',
      habitUpdated: 'Kebiasaan berhasil diperbarui!',
      habitDeleted: 'Kebiasaan telah dihapus.',
      allDeleted: 'Semua kebiasaan berhasil dihapus.',
      streakReset: 'Streak habit "{name}" kamu reset! Tetap semangat bangun kebiasaan lagi dari awal!',
      languageChanged: 'Bahasa berhasil diubah ke Bahasa Indonesia',
    },
  },
  en: {
    nav: {
      title: 'Habit Tracker',
      activeHabits: 'active habits',
      profile: 'My Profile',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      deleteAll: 'Delete All Habits',
      logout: 'Log Out',
      signInSignUp: 'Sign In / Sign Up',
      language: 'Language',
      indonesian: 'Bahasa Indonesia',
      english: 'English',
    },
    tabs: {
      today: 'Today',
      good: 'Good',
      bad: 'Bad',
      stats: 'Stats',
    },
    hero: {
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      noHabits: 'No habits added yet.',
      allDone: 'Amazing! All habits completed 🏆',
      progressText: "Let's make small progress today. {completed}/{total} completed.",
      activeStreak: 'Active Streak',
      days: 'days',
      completionRate: 'Completion',
    },
    habitCard: {
      done: 'Done',
      undone: 'Pending',
      streak: 'Streak',
      totalDone: 'Total Done',
      target: 'Target',
      timesPerDay: 'x / day',
      addNote: 'Add Note',
      editNote: 'Edit Note',
      notePlaceholder: 'Write a daily note for this habit...',
      editHabit: 'Edit Habit',
      deleteHabit: 'Delete Habit',
      confirmDelete: 'Delete This Habit?',
      confirmDeleteDesc: 'This action cannot be undone. This habit history will be permanently removed.',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      badHabitAvoided: 'Successfully Avoided',
      badHabitDone: 'Occurred',
      times: 'times',
    },
    addHabit: {
      addTitle: 'Add New Habit',
      editTitle: 'Edit Habit',
      habitNameLabel: 'Habit Name',
      habitNamePlaceholder: 'E.g., Drink 2L Water, Meditate, Read Book...',
      typeLabel: 'Habit Type',
      goodType: 'Good Habit',
      goodTypeDesc: 'Positive habit you want to build',
      badType: 'Bad Habit',
      badTypeDesc: 'Habit you want to eliminate/reduce',
      categoryLabel: 'Category',
      targetLabel: 'Daily Target (Frequency)',
      timesPerDay: 'times per day',
      iconLabel: 'Select Icon',
      colorLabel: 'Select Color',
      saveButton: 'Add Habit',
      updateButton: 'Save Changes',
      cancelButton: 'Cancel',
    },
    stats: {
      title: 'Statistics & Progress',
      subtitle: 'Track your consistency and habit milestones',
      totalHabits: 'Total Habits',
      completionRate: 'Completion Rate',
      activeStreak: 'Active Streak',
      bestStreak: 'Highest Streak',
      activityHeatmap: '365-Day Activity Heatmap',
      activityChart: 'Activity Chart',
      performanceSummary: 'Performance Summary',
      less: 'Less',
      more: 'More',
      goodVsBad: 'Good vs Bad Habits',
      goodHabits: 'Good Habits',
      badHabits: 'Bad Habits',
      weeklyProgress: 'Weekly Progress',
      last30DaysSummary: 'Performance summary for the last 30 days',
      positiveTrend: 'Positive Trend',
      needsAttention: 'Needs Attention',
      overallAverage: 'Overall Average',
      streakDetails: 'Streak Details',
      streakRecordDesc: 'Your habit consistency records',
      highestStreak: 'Highest Streak',
      noActiveStreak: 'No active streak yet',
      good: 'good',
      bad: 'bad',
      empty: 'empty',
    },
    dateSelector: {
      today: 'Today',
      yesterday: 'Yesterday',
      selectDate: 'Select Date',
    },
    dayDetail: {
      title: 'Activity Details',
      date: 'Date',
      habitsCompleted: 'Habits Completed',
      noActivity: 'No activity recorded on this date.',
      notes: 'Daily Notes',
      close: 'Close',
    },
    emptyState: {
      title: 'No Habits Yet',
      description: 'Start building your positive routine today. Create your first habit now!',
      actionButton: 'Create First Habit',
      noGoodHabits: 'No good habits yet',
      noBadHabits: 'No bad habits yet',
      clickPlusHint: 'Click the + button on bottom navbar',
      toCreateGood: 'to create a new good habit.',
      toCreateBad: 'to create a new bad habit.',
      goodBanner: 'Good habits help you grow and thrive. Stay consistent!',
      badBanner: 'Track bad habits to recognize patterns and eliminate them.',
    },
    templates: {
      morningRoutine: {
        name: 'Morning Routine',
        habits: ['Drink 2 glasses of water', '5-min Meditation', 'Light Stretching'],
      },
      fitness: {
        name: 'Fitness',
        habits: ['30-min Jogging', '50 Push-ups', 'Drink Protein Shake'],
      },
      reading: {
        name: 'Reading',
        habits: ['Read 10 pages', 'Note favorite quotes', 'Review what was read'],
      },
      templateAdded: 'Template {name} added!',
      habitsAddedCount: '{count} habits have been added.',
    },
    allDone: {
      title: 'All Habits Completed! 🎉',
      subtitle: 'You have accomplished all your targets for today. Keep up the consistency!',
      quote: '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." – Aristotle',
    },
    login: {
      title: 'Build Good Habits, Achieve Your Dreams',
      subtitle: 'Interactive Habit Tracker to build positive routines & eliminate bad habits.',
      loginTitle: 'Sign In to Account',
      loginSubtitle: 'Sign in to continue tracking your habits.',
      registerTitle: 'Create New Account',
      registerSubtitle: 'Create an account to keep your habit data synced.',
      forgotTitle: 'Password Recovery',
      forgotSubtitle: 'Enter your email address to receive password reset instructions.',
      fullNamePlaceholder: 'Full name',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      passwordMinPlaceholder: 'Password (min. 6 characters)',
      forgotPassword: 'Forgot password?',
      enterDashboard: 'Enter Dashboard',
      orOtherOptions: 'Or continue with',
      signInWith: 'Sign in with',
      signInGoogle: 'Continue with Google',
      newHere: 'New here?',
      createNewAccount: 'Create new account',
      alreadyHaveAccount: 'Already have an account?',
      signInLink: 'Sign in to account',
      createAccountNow: 'Create Account Now',
      sendResetInstructions: 'Send Reset Instructions',
      back: 'Back',
      tryGuest: 'Try Guest Mode (No Account)',
      guestNotice: 'Guest Mode stores your data locally in your browser.',
      features: {
        streakTitle: '21-Day Streak Tracking',
        streakDesc: 'Form permanent habits with visual daily progress tracking.',
        privacyTitle: 'Privacy Guaranteed',
        privacyDesc: 'Your data is safely stored in the cloud or locally based on your choice.',
        statsTitle: 'Analytics & Heatmap',
        statsDesc: 'Visualize your consistency with a GitHub-style contribution calendar.',
      },
    },
    profile: {
      title: 'User Profile',
      subtitle: 'Manage your profile photo and account identity',
      changeAvatar: 'Change Avatar',
      customUrl: 'Custom Image URL',
      orSelectPreset: 'Or select a default avatar:',
      removeAvatar: 'Remove Custom Avatar',
      save: 'Save',
      close: 'Cancel',
    },
    toast: {
      habitAdded: 'New habit added successfully!',
      habitUpdated: 'Habit updated successfully!',
      habitDeleted: 'Habit has been deleted.',
      allDeleted: 'All habits deleted successfully.',
      streakReset: 'Streak for habit "{name}" reset! Stay motivated to build it back!',
      languageChanged: 'Language changed to English',
    },
  },
};
