import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      brand: 'LDN Trade',
      nav: {
        search: 'Search',
        enrolled: 'Enrolled',
        signIn: 'Sign In',
        signOut: 'Sign Out',
        contact: 'Contact',
      },
      actions: {
        refresh: "Refresh",
        view_details: "View details",
        enroll: "Enroll",
        confirm: "Confirm",
        fail: "Fail",
        verify: "Verify"
      },
      sections: {
        pending_payments: "Pending Payments",
        pending_users: "Pending Users",
        pending_businesses: "Pending Businesses"
      },
      statuses: {
        pending: "Pending",
        confirmed: "Confirmed",
        failed: "Failed"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "User: {{name}} ({{email}})",
        course_line: "Course: {{course}}",
        proof_line: "Proof: {{hash}}",
        created_at: "Created: {{date}}",
        owner_line: "Owner: {{owner}}",
        yes: "Yes",
        no: "No",
        na: "n/a"
      },
      empty_states: {
        no_pending_payments: "No pending payments.",
        no_pending_users: "No pending users.",
        no_pending_businesses: "No pending businesses."
      },
      forbidden: {
        title: "Forbidden",
        message: "You must be an admin to view this page."
      },
      checkout: {
        title: "Checkout",
        subtitle: "Secure your seat with fast, flexible payment methods.",
        free: "Free",
        no_tier: "No course tier selected. Go back and choose a course.",
        customer: {
          details: "Customer Details",
          full_name: "Full Name",
          email: "Email",
          country: "Country/Region",
          pref_lang: "Preferred Course Language"
        },
        lang: { en: "English", ar: "Arabic", fr: "French" },
        placeholders: {
          name: "Your name",
          country: "Choose country"
        },
        payment: {
          title: "Payment Method",
          usdt: "USDT (TRC20)",
          libyana: "Libyana Balance",
          madar: "Madar Balance"
        },
        libyana: {
          title: "Pay with Libyana Balance",
          instructions: "Send the payment to the following number:",
          note: "After payment, your enrollment will be confirmed by our team."
        },
        madar: {
          title: "Pay with Madar Balance",
          instructions: "Send the payment to the following number:",
          note: "After payment, your enrollment will be confirmed by our team."
        },
        actions: {
          complete: "Complete Purchase",
          back: "Back"
        },
        summary: {
          title: "Order Summary",
          course: "Course",
          subtotal: "Subtotal",
          taxes: "Taxes",
          total: "Total"
        },
        benefits: {
          certificate: "You’ll receive a certificate of achievement",
          lifetime: "Lifetime access to all tiers",
          vipSignals: "+ our Telegram VIP signals group",
          brokerBonus: "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits"
        },
        modal: {
          title: "Payment Details",
          remaining: "Time remaining:",
          send_to: "Send USDT (TRC20) to:",
          amount: "Amount (approx):",
          txid_prompt: "Enter your transaction hash (TXID) after sending the USDT.",
          txid_ph: "Transaction hash",
          phone_prompt: "Enter the phone number you sent the balance from.",
          status: "Current status:",
          verifying: "We are verifying your transaction. This can take a few minutes.",
          awaiting: "Awaiting manual confirmation from admin. You will receive access once verified.",
          close: "Close",
          paid: "I've Paid"
        },
        errors: {
          txid_required: "Please enter the transaction hash",
          phone_required: "Please enter the sender phone number",
          proof_failed: "Failed to submit proof"
        }
      },
      // NEW: unified keys referenced by ContentAdmin
      common: {
        select: 'Select',
        save: 'Save',
        // aliases used in admin communications panel
        showAll: 'Show all',
        refresh: 'Refresh',
        noMessages: 'No messages found',
        no_messages: 'No messages found',
        only_unread: 'Only unread',
        show_all: 'Show all',
        export_csv: 'Export CSV',
        course: 'Course',
        message: 'Message',
        meta: 'Metadata',
        page: 'Page',
        reply: 'Reply',
        whatsapp: 'WhatsApp',
        show: 'Show',
        create: 'Create',
        delete: 'Delete',
        confirm: 'Confirm',
        reject: 'Reject',
        upload: 'Upload',
        hide: 'Hide',
        loading: 'Loading...',
        prev: 'Previous',
        next: 'Next',
        price: 'Price',
        price_usdt: 'Price (USDT)',
        price_stripe: 'Price (Stripe cents)',
        currency: 'Currency',
        expires_at: 'Expires at',
        title: 'Title',
        subtitle: 'Subtitle',
        note: 'Note',
        close: 'Close',
        name: 'Name',
        origin: 'Origin',
        destination: 'Destination',
        airline: 'Airline',
        image_url: 'Image URL',
        expires_in: 'Expires in',
        select_image: 'Select image…',
        preview: 'preview',
        forbidden: 'Forbidden', // used as fallback in ContentAdmin
      },
      instructor: {
        name: 'Instructor Name',
        avatar_url: 'Avatar URL',
        bio: 'Instructor Bio',
        upload_photo: 'Upload Instructor Photo',
      },
      course: {
        level: {
          beginner: 'BEGINNER',
          intermediate: 'INTERMEDIATE',
          advanced: 'ADVANCED'
        }
      },
      social: {
        telegram_embed: 'Telegram embed URL',
        telegram_join: 'Telegram join URL',
        discord_widget: 'Discord widget ID',
        discord_invite: 'Discord invite URL',
        twitter_timeline: 'X/Twitter timeline URL'
      },
      materials: {
        title: 'Materials',
        load: 'Load Materials',
        upload_pdf: 'Upload PDF',
        upload_video: 'Upload Video',
        none: 'No materials loaded. Click "Load Materials".',
        staged_title: 'Materials (staged)',
        add_pdfs: 'Add PDFs',
        add_videos: 'Add Videos',
        files_selected: '{{count}} file(s) selected',
        staged_note: 'These will be uploaded and attached after you click Create.'
      },
      admin: {
        title: 'Admin Dashboard',
        communications: 'Communications',
        jobs: 'Jobs',
        applications: 'Applications',
        promos: 'Promos',
        comm: {
          search_ph: 'Search name, email, message…',
          status_read: 'READ',
          status_open: 'OPEN',
          mark_unread: 'Mark unread',
          mark_read: 'Mark read',
          ticket_id: 'Ticket',
        },
        content: 'Content',
        admin_overview: 'Admin Overview',
        pending_transactions: 'Pending Transactions',
        banners: 'Banners',
        trailer_url: 'Trailer URL',
        revenue_over_time: 'Revenue Over Time',
        traffic_conversions: 'Traffic & Conversions',
        purchase_status_breakdown: 'Purchase Status Breakdown',
        revenue_split: 'Revenue Split',
        top_courses_revenue: 'Top Courses by Revenue',
        course_views_sales: 'Course Views vs Sales',
        preview_url: 'Preview URL',
        upload_trailer: 'Upload Trailer (video)',
        upload_preview: 'Upload Preview (video)',
        course_tiers: 'Course Tiers',
        subtitle: 'Manage verifications and discovery content',
        quick_actions: 'Quick Actions',
        verifications: 'Verifications',
        analytics: 'Analytics',
        create_content: 'Create Content',
        create_banner: 'Create New',
        pending_users: 'Pending Users',
        pending_businesses: 'Pending Businesses',
        pending_payments: "Pending Payments",
        pending_usdt: "Pending USDT",
        pending_balance: "Pending Balance",
        overview: 'Overview',
        view: 'View',
        must_be_admin: 'You must be an admin to view this page.'
      },
      header: {
        hi: 'Hi, {{name}}',
        dashboard: 'Dashboard',
        account: 'My account',
        cart: 'Cart',
        emptyCart: 'Empty Cart',
        clearCart: 'Clear Cart',
      },
      dashboard: {
        title: 'Dashboard',
        communications: "Communications",
        admin: 'Admin',
        subtitle: 'Manage your courses and account',
        available: 'Available',
        pending_transactions: 'Pending Transactions',
        active_learning: 'Active Learning',
        overview: 'Overview',
        courses: 'My Courses',
        all_time: 'All Time',
        total_revenue: 'Total Revenue',
        users: 'Users',
        site_views: 'Site Views',
        sessions_purchase: 'Sessions → Purchase',
        session_conversion: 'Session conversion',
        signup_buyer: 'Signup → Buyer',
        lead_conversion: 'Lead conversion',
        arpu_aov: 'ARPU / AOV',
        avg_rev_user_aov: 'Avg Rev/User • AOV',
        usdt_stripe: 'USDT + Stripe',
        pending_over_time: 'Pending Over Time',
        purchase_id: 'ID',
        user: 'User',
        tier: 'Tier',
        pending: 'PENDING',
        proof: 'Proof',
        id: 'ID',
        email: 'Email',
        name: 'Name',
        account: 'Account',
        purchases: 'Purchases',
        settings: 'Settings',
        language: 'Language',
        total_courses: 'Total Courses',
        enrolled: 'Enrolled',
        no_courses: 'You are not enrolled in any courses yet.',
        continue: 'Continue',
        no_purchases: 'No purchases yet.',
        open: 'Open',
        settings_hint: 'Use the header controls to switch language. More settings coming soon.'
      },
      account: {
        title: 'My account',
        subtitle: 'Profile details and account settings',
      },
      title: "Trading Courses",
      states: {
        loading: "Loading…",
        empty: "No courses yet."
      },
      errors: {
        load_failed: "Failed to load courses"
      },
      levels: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced"
      },
      price: {
        usd: "USD {{value}}",
        usdt: "USDT {{value}}"
      },
      learn: {
        loading: "Loading course...",
        course_fallback: "Course",
        actions: {
        my_courses: "My Courses",
        mark_completed: "I'm done"
        },
        completion: {
          marked: "Marked as Completed"
        },
        instructor: {
          title: "Instructor"
        },
        materials: {
          title: "Course Materials",
          preview: "Preview Video",
          trailer: "Trailer",
          telegram: "Telegram Group",
          discord: "Discord",
          twitter: "Twitter",
          empty: "No materials published yet."
        },
        reviews: {
          title: "Reviews",
          loading: "Loading reviews…",
          leave: "Leave a review",
          submit: "Submit Review",
          rating_required: "Rating required",
          thanks: "Thank you for your review!",
          submit_failed: "Failed to submit review",

          comment_placeholder: "Write your review here...",
          verified: "Verified",
          empty: "No reviews yet.",
        },
        documents: {
          title: "Documents",
          loading: "Loading document…"
        },
        certificate: {
          get: "Get Certificate",
          share: "Share Certificate",
          download: "Download Certificate",
          copy: "Copy Link",
          copied: "Copied Link",
          preview: "Preview Certificate"
        },
        videos: {
          title: "Videos"
        },
        guard: {
          note: "Downloads are disabled. Screenshots are discouraged."
        },
        support: {
          title: "Need help?",
          body: "If you believe this access is in error, contact support and include your purchase ID."
        },
        access: {
          title: "Course Access",
          denied_fallback: "You do not have access to this course.",
          back_to_my_courses: "Back to My Courses"
        },
        errors: {
          access_denied: "Access denied. You must be enrolled to view this course.",
          load_failed: "Failed to load course",
          complete_failed: "Failed to mark course as completed"
        },
        watermark: {
          user: "User: {{user}}"
        },
        capture: {
          title: "Screenshot blocked",
          body: "For your privacy and to protect this course, screenshots and captures are restricted.",
          pfp_blocked: "Screenshot blocked"
        }
      },
      contact: {
        title: "Contact Us",
        subtitle: "Send us a message and we will get back to you shortly.",
        name: "Your Name",
        name_ph: "John Doe",
        email: "Email",
        email_ph: "you@example.com",
        course: "Course (optional)",
        course_ph: "Select a course",
        course_fallback: "Course",
        message: "Message",
        message_ph: "Tell us more about what you need...",
        send: "Send Message",
        sent: "Your message has been sent. We will get back to you soon.",
        error_send: "Failed to send message",
        validation_required: "Please fill all required fields.",
        alt: "Prefer WhatsApp or Telegram?",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        default_text: "Hello, I would like to know more about your courses.",
        course_id: "Course ID",
        toast_sent_title: "Message sent",
        toast_sent_desc: "We will get back to you shortly."
      },
      home: {
        offers: 'Limited-time Offers',
        badge: { exclusive: 'Exclusive' },
        trip_type: 'Trip type',
        enroll: 'Enroll',
        class: 'Class',
        remove_segment: 'Remove',
        multi_validation: 'Please fill all multi-city segment fields',
        search_validation: 'Please provide origin, destination, and departure date',
        searching: 'Searching...',
        form_note: 'Free cancellations on selected fares',
        trust_line: 'Trusted by travelers worldwide • Premium support 24/7',
        search: 'Search',
        hero: {
          title: 'Learn from the best.',
          subtitle: 'Our programs help turn your dreams into reality.',
          cta_primary: 'Browse Courses',
          cta_secondary: 'Explore Curriculum',
        },
        trustpilot: {
          title: "Verified by learners — and it shows",
          badge: "Trustpilot Verified",
          headline1: "Trustpilot Verified",
          ratingText1: "Excellent • 4.8 out of 5",
          reviewsCount1: "1,200+ reviews",
          proofText1: "Real students. Real outcomes.",
          headline2: "Highly Rated by Learners",
          ratingText2: "4.9/5 Average Instructor Rating",
          reviewsCount2: "Top 1% in category",
          proofText2: "Independently verified feedback.",
          headline3: "Trusted in MENA & Beyond",
          ratingText3: "Global community of learners",
          reviewsCount3: "Growing every week",
          proofText3: "Transparency you can count on."
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Find quick answers below. Still stuck? Reach out — we’re happy to help.",
          items: [
            { q: "Who are these programs for?", a: "Beginners to advanced learners looking for structured, outcome-focused training." },
            { q: "How are the courses delivered?", a: "Live cohorts and self-paced modules with community support and downloadable resources." },
            { q: "Do I get a certificate?", a: "Yes, you’ll receive a certificate of completion you can share on LinkedIn." },
            { q: "Can I try before committing?", a: "We offer previews and sample lessons so you can explore before you enroll." }
          ]
        },
        benefits: {
          title: 'Experience a Unique Learning Journey',
          one: 'Expert-Led Curriculum',
          one_desc: 'Structured paths from fundamentals to advanced strategies.',
          two: 'Actionable Lessons',
          two_desc: 'Projects and case studies designed for real outcomes.',
          three: 'Premium Community',
          three_desc: 'Access mentorship, events and private channels.',
          four: 'Shariah-compliant',
          four_desc: 'All courses teach Shariah-compliant trading.',
        },
        features: {
          title: 'What Makes Our Programs Unique',
          one: 'Foundations to Mastery',
          one_desc: 'From basics to advanced methodology in a clear track.',
          two: 'Cohort-Based Learning',
          two_desc: 'Learn with peers, guided by instructors.',
          three: 'Resources Library',
          three_desc: 'Templates, checklists and downloads included.',
          four: 'Certificate of Completion',
          four_desc: 'Showcase your achievement upon graduation.',
        },
        courses: {
          title: 'Featured Courses',
          cta: 'View Curriculum',
          view: 'View Now',
        },
        cta: {
          kicker: 'Ready to Learn?',
          title: 'Start Your Learning Journey Today',
          subtitle: 'Join learners globally and access our premium course library.',
          primary: 'Browse Courses',
          secondary: 'Contact Us',
        },
      },
      features: {
        title: 'Why Choose Us',
        pricing: {
          title: 'Best Price Guarantee',
          desc: "Find a lower price? We'll match it and give you an extra 5% off",
        },
        support: {
          title: '24/7 Premium Support',
          desc: 'Expert travel consultants available around the clock',
        }
      },
      footer: {
        tagline: 'Level up your skills with curated, hands-on courses.',
        rights: 'All rights reserved.',
        courses: 'Courses',
        popular: 'Popular',
        new: 'New & Trending',
        bundles: 'Bundles & Offers',
        about: 'About Us',
        careers: 'Careers',
        press: 'Press',
        support: 'Support',
        help: 'Help Center',
        contact: 'Contact Us',
        terms: 'Terms',
        connect: 'Connect',
        newsletter: 'Newsletter',
        social: 'Social Media',
        blog: 'Blog',
        learn: 'Learn',
        faq: 'FAQ',
        policy: 'Our Policy',
        resources: 'Resources',
        contact_us: 'Contact Us',
        company: 'Company',
        about_short: 'About',
      },
      auth: {
        login: 'Log in',
        login_title: 'Welcome back',
        login_subtitle: 'Access premium courses, curated signals and dedicated support',
        login_cta: 'Sign in',
        no_account: 'Don\'t have an account?',
        join_us: 'Join LDN Trade',
        login_loading: 'Signing you in…',
        login_error: 'Login failed',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',

        register: 'Create account',
        register_title: 'Create your account',
        register_error: 'Registration failed',
        registering: 'Registering…',
        create_account: 'Create account',
        already_have: 'Already have an account?',
        have_account: 'Have an account?',

        name: 'Name',
        name_placeholder: 'Full name',
        email: 'Email',
        email_placeholder: 'you@example.com',
        password: 'Password',
        password_placeholder: '8+ characters',
        phone: 'Phone',
        phone_placeholder: 'Enter your number without country code',
        // register extras
        send_otp: 'Send OTP',
        otp_placeholder: 'Enter OTP',
        otp_sent: 'OTP sent. Please check your phone.',
        otp_verify_failed: 'Failed to verify OTP',
        verify: 'Verify',
        phone_verified: 'Phone verified.',
        open_whatsapp: 'Open WhatsApp',
        whatsapp_required: 'Your phone must be linked to WhatsApp to receive the OTP.',
        phone_required: 'Please enter your phone number.',
        phone_verify_required: 'Please verify your phone via OTP.',
        duplicate_email: 'Email already registered',
        error_underage: 'You must be at least 18 years old.',
        error_overage: 'Please enter a valid date of birth.',
        show: 'Show',
        nationality: 'Nationality',
        nationality_placeholder: 'e.g., Libya',
        hide: 'Hide',

        account_type: 'Account type',
        personal_account: 'Personal',
        business_account: 'Business / Agency',

        dob: 'Date of birth',
        gender: 'Gender',
        gender_male: 'Male',
        gender_female: 'Female',
        gender_other: 'Other',
      },
      tooltip: {
        lightMode: 'Switch to light mode',
        darkMode: 'Switch to dark mode',
        logout: 'Logout',
      },
      aria: {
        toggleTheme: 'Toggle theme',
        logout: 'Logout',
      }
    }
  },

  fr: {
    translation: {
      brand: 'LDN Trade',
      nav: {
        search: 'Rechercher',
        enrolled: 'Enrolled',
        signIn: 'Se connecter',
        signOut: 'Se déconnecter',
        contact: 'Contact',
      },
      actions: {
        refresh: "Actualiser",
        confirm: "Confirmer",
        view_details: "Voir les détails",
        enroll: "S’inscrire",
        fail: "Échouer",
        verify: "Vérifier"
      },
      sections: {
        pending_payments: "Paiements en attente",
        pending_users: "Utilisateurs en attente",
        pending_businesses: "Entreprises en attente"
      },
      statuses: {
        pending: "En attente",
        confirmed: "Confirmé",
        failed: "Échoué"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "Utilisateur : {{name}} ({{email}})",
        course_line: "Cours : {{course}}",
        proof_line: "Preuve : {{hash}}",
        created_at: "Créé : {{date}}",
        owner_line: "Propriétaire : {{owner}}",
        yes: "Oui",
        no: "Non",
        na: "s.o."
      },
      empty_states: {
        no_pending_payments: "Aucun paiement en attente.",
        no_pending_users: "Aucun utilisateur en attente.",
        no_pending_businesses: "Aucune entreprise en attente."
      },
      forbidden: {
        title: "Interdit",
        message: "Vous devez être administrateur pour consulter cette page."
      },
      common: {
        select: "Sélectionner",
        save: "Enregistrer",
        delete: "Supprimer",
        // aliases used in admin communications panel
        showAll: 'Tous les messages',
        only_unread: 'Seulement les messages non lus',
        noMessages: 'Aucun message trouvé',
        refresh: 'Actualiser',
        no_messages: 'Aucun message trouvé',
        show_all: 'Tous les messages',
        export_csv: 'Exporter en CSV',
        course: 'Cours',
        message: 'Message',
        meta: 'Metadata',
        page: 'Page',
        reply: 'Répondre',
        whatsapp: 'WhatsApp',
        show: "Afficher",
        create: "Créer",
        confirm: 'Confirmer',
        reject: 'Rejeter',
        upload: "Téléverser",
        loading: 'Chargement...',
        price: "Prix",
        price_usdt: "Prix (USDT)",
        price_stripe: "Prix (Stripe, centimes)",
        currency: "Devise",
        expires_at: "Expire le",
        prev: "Précédent",
        next: "Suivant",
        title: "Titre",
        subtitle: "Sous-titre",
        note: "Remarque",
        close: "Fermer",
        name: "Nom",
        origin: "Origine",
        destination: "Destination",
        airline: "Compagnie aérienne",
        image_url: "URL de l’image",
        expires_in: "Expire dans",
        select_image: "Sélectionner une image…",
        preview: "aperçu",
        forbidden: 'Interdit',
      },
      instructor: {
        name: "Nom du formateur",
        avatar_url: "URL de l’avatar",
        bio: "Bio du formateur",
        upload_photo: "Téléverser la photo du formateur",
      },
      course: {
        level: {
          beginner: 'DÉBUTANT',
          intermediate: 'INTERMÉDIAIRE',
          advanced: 'AVANCÉ'
        }
      },
      social: {
        telegram_embed: "URL d’intégration Telegram",
        telegram_join: "URL d’invitation Telegram",
        discord_widget: "ID du widget Discord",
        discord_invite: "URL d’invitation Discord",
        twitter_timeline: "URL du fil X/Twitter"
      },
      materials: {
        title: "Ressources",
        load: "Charger les ressources",
        upload_pdf: "Téléverser un PDF",
        upload_video: "Téléverser une vidéo",
        none: "Aucune ressource chargée. Cliquez sur « Charger les ressources ».",
        staged_title: "Ressources (en attente)",
        add_pdfs: "Ajouter des PDF",
        add_videos: "Ajouter des vidéos",
        files_selected: "{{count}} fichier(s) sélectionné(s)",
        staged_note: "Elles seront téléversées et rattachées après avoir cliqué sur Créer."
      },
      admin: {
        title: 'Tableau de bord',
        content: 'Contenu',
        banners: 'Bannières',
        jobs: 'Postes vacants',
        applications: 'Postulants',
        communications: 'Communications',
        promos: 'Promos',
        comm: {
          search_ph: 'Rechercher nom, e-mail, message…',
          status_read: 'LU',
          status_open: 'OUVERT',
          mark_unread: 'Marquer comme non lu',
          mark_read: 'Marquer comme lu',
          ticket_id: 'Ticket',
        },
        admin_overview: 'Vue d’ensemble',
        pending_transactions: 'Transactions en attente',
        trailer_url: 'URL de la bande-annonce',
        revenue_over_time: 'Revenus dans le temps',
        traffic_conversions: 'Trafic & conversions',
        purchase_status_breakdown: 'Répartition des statuts d’achats',
        revenue_split: 'Répartition des revenus',
        top_courses_revenue: 'Meilleurs cours par revenus',
        course_views_sales: 'Vues du cours vs ventes',
        preview_url: 'URL de l’aperçu',
        upload_trailer: 'Téléverser la bande-annonce (vidéo)',
        upload_preview: 'Téléverser l’aperçu (vidéo)',
        course_tiers: 'Paliers de cours',
        subtitle: 'Gérez les vérifications et le contenu de découverte',
        quick_actions: 'Actions rapides',
        verifications: 'Vérifications',
        analytics: 'Analytics',
        create_content: 'Créer du contenu',
        create_banner: 'Créer une bannière',
        pending_users: 'Utilisateurs en attente',
        pending_businesses: 'Entreprises en attente',
        pending_payments: "Paiements en attente",
        pending_usdt: "USDT en attente",
        pending_balance: "Solde en attente",
        overview: 'Aperçu',
        view: 'Voir',
        must_be_admin: "Vous devez être administrateur pour consulter cette page."
      },
      dashboard: {
        title: 'Tableau de bord',
        subtitle: 'Gérez vos cours et votre compte',
        overview: 'Aperçu',
        available: 'Disponible',
        pending_transactions: 'Transactions en attente',
        active_learning: 'Apprendre Actif',
        courses: 'Mes cours',
        admin: 'Admin',
        total_revenue: 'Revenu total',
        all_time: 'Tout le temps',
        users: 'Utilisateurs',
        site_views: 'Vues du site',
        sessions_purchase: 'Sessions → Achat',
        session_conversion: 'Conversion des sessions',
        signup_buyer: 'Inscription → Acheteur',
        lead_conversion: 'Conversion des leads',
        arpu_aov: 'ARPU / AOV',
        avg_rev_user_aov: 'Revenu moyen/utilisateur • AOV',
        usdt_stripe: 'USDT + Stripe',
        pending_over_time: 'Évolutions des en attentes',
        purchase_id: 'ID',
        user: 'Utilisateur',
        tier: 'Palier',
        pending: 'EN ATTENTE',
        proof: 'Preuve',
        id: 'ID',
        email: 'E-mail',
        name: 'Nom',
        account: 'Compte',
        purchases: 'Achats',
        settings: 'Paramètres',
        language: 'Langue',
        total_courses: 'Nombre de cours',
        enrolled: 'Inscrit',
        no_courses: "Vous n'êtes inscrit à aucun cours.",
        continue: 'Continuer',
        no_purchases: "Aucun achat pour le moment.",
        open: 'Ouvrir',
        settings_hint: "Utilisez l’en-tête pour changer la langue. D’autres réglages arrivent."
      },
      admin_legacy: { // keep your original FR admin dashboard copy block for safety
        title: 'Tableau de bord',
        content: 'Contenu',
        banners: 'Bannières',
        subtitle: 'Gérez vos cours et votre compte',
        overview: 'Aperçu',
        courses: 'Mes cours',
        account: 'Compte',
        purchases: 'Achats',
        settings: 'Paramètres',
        total_courses: 'Nombre de cours',
        enrolled: 'Inscrit',
        no_courses: "Vous n'êtes inscrit à aucun cours.",
        continue: 'Continuer',
        no_purchases: "Aucun achat pour le moment.",
        open: 'Ouvrir',
        settings_hint: "Utilisez l’en-tête pour changer la langue. D’autres réglages arrivent."
      },
      learn: {
        loading: "Chargement du cours…",
        course_fallback: "Cours",
        actions: {
          my_courses: "Mes cours",
          mark_completed: "J'ai fini"
        },
        completion: {
          marked: "Marqué comme terminé"
        },
        instructor: {
          title: "Formateur"
        },
        certificate: {
          get: "Obtenir le certificat",
          share: "Partager le certificat",
          download: "Télécharger le certificat",
          copy: "Copier le lien",
          copied: "Lien copié",
          preview: "Aperçu"
        },
        materials: {
          title: "Ressources du cours",
          preview: "Vidéo d’aperçu",
          trailer: "Bande-annonce",
          telegram: "Groupe Telegram",
          discord: "Discord",
          twitter: "Twitter",
          empty: "Aucune ressource publiée pour le moment."
        },
        reviews: {
          title: "Avis",
          loading: "Chargement des avis…",
          leave: "Laisser un avis",
          submit: "Soumettre l'avis",
          rating_required: "Note requise",
          thanks: "Merci pour votre avis!",
          submit_failed: "Échec de la soumission de l'avis",
          comment_placeholder: "Écrivez votre avis ici...",
          verified: "Vérifié",
          empty: "Aucun avis pour le moment."
        },
        documents: {
          title: "Documents",
          loading: "Chargement du document…"
        },
        videos: {
          title: "Vidéos"
        },
        guard: {
          note: "Le téléchargement est désactivé. Les captures d’écran sont déconseillées."
        },
        support: {
          title: "Besoin d’aide ?",
          body: "Si cet accès vous paraît erroné, contactez le support et joignez votre identifiant d’achat."
        },
        access: {
          title: "Accès au cours",
          denied_fallback: "Vous n’avez pas accès à ce cours.",
          back_to_my_courses: "Retour à Mes cours"
        },
        errors: {
          access_denied: "Accès refusé. Vous devez être inscrit pour voir ce cours.",
          load_failed: "Échec du chargement du cours",
          complete_failed: "Échec de la marquage du cours comme terminé"
        },
        watermark: {
          user: "Utilisateur : {{user}}"
        },
        capture: {
          title: "Capture d’écran bloquée",
          body: "Pour votre confidentialité et la protection du cours, les captures et enregistrements sont restreints.",
          pfp_blocked: "Capture bloquée"
        }
      },
      home: {
        hero: {
          title: 'Apprenez auprès de l’élite du secteur.',
          subtitle: 'Nos programmes vous aident à réaliser vos rêves.',
          cta_primary: 'Parcourir les cours',
          cta_secondary: 'Explorer le programme',
        },
        trustpilot: {
          title: "Vérifié par les apprenants — et ça se voit",
          badge: "Vérifié par Trustpilot",
          headline1: "Vérifié par Trustpilot",
          ratingText1: "Excellent • 4,8 sur 5",
          reviewsCount1: "Plus de 1 200 avis",
          proofText1: "De vrais étudiants. De vrais résultats.",
          headline2: "Hautement apprécié par les apprenants",
          ratingText2: "4,9/5 Note moyenne des formateurs",
          reviewsCount2: "Top 1 % de la catégorie",
          proofText2: "Avis vérifiés de manière indépendante.",
          headline3: "Fiable au Moyen-Orient, en Afrique du Nord et au-delà",
          ratingText3: "Communauté mondiale d’apprenants",
          reviewsCount3: "En croissance chaque semaine",
          proofText3: "Une transparence sur laquelle vous pouvez compter."
        },
        faq: {
          title: "Questions Fréquemment Posées",
          subtitle: "Trouvez des réponses rapides ci-dessous. Encore des doutes ? Contactez-nous — nous serons ravis de vous aider.",
          items: [
            { "q": "À qui s’adressent ces programmes ?", "a": "Aux débutants comme aux apprenants avancés cherchant une formation structurée et axée sur les résultats." },
            { "q": "Comment les cours sont-ils dispensés ?", "a": "Par des cohortes en direct et des modules en autonomie avec un soutien communautaire et des ressources téléchargeables." },
            { "q": "Est-ce que je reçois un certificat ?", "a": "Oui, vous recevrez un certificat d’achèvement que vous pourrez partager sur LinkedIn." },
            { "q": "Puis-je essayer avant de m’engager ?", "a": "Nous proposons des aperçus et des leçons d’essai afin que vous puissiez explorer avant de vous inscrire." }
          ]
        },
        benefits: {
          title: 'Vivez une expérience d’apprentissage luxueuse',
          one: 'Programme dirigé par des experts',
          one_desc: 'Des parcours structurés, des bases aux stratégies avancées.',
          two: 'Leçons concrètes',
          two_desc: 'Projets et études de cas pour des résultats réels.',
          three: 'Communauté premium',
          three_desc: 'Mentorat, événements et espaces privés.',
          four: 'Conformité Shariah',
          four_desc: 'Toutes les leçons enseignent des stratégies conformes au Shariah.',
        },
        features: {
          title: 'Ce qui rend nos programmes d’élite',
          one: 'Des fondations à la maîtrise',
          one_desc: 'Un parcours clair jusqu’aux méthodologies avancées.',
          two: 'Apprentissage en cohorte',
          two_desc: 'Apprenez avec vos pairs, guidés par des formateurs.',
          three: 'Bibliothèque de ressources',
          three_desc: 'Modèles, checklists et téléchargements inclus.',
          four: 'Certificat de réussite',
          four_desc: 'Valorisez votre accomplissement après le cursus.',
        },
        courses: {
          title: 'Cours à la une',
          cta: 'Voir le programme',
          view: 'Voir le programme',
        },
        cta: {
          kicker: 'Prêt à apprendre ?',
          title: 'Commencez votre parcours dès aujourd’hui',
          subtitle: 'Rejoignez des apprenants dans le monde entier et accédez à notre bibliothèque premium.',
          primary: 'Parcourir les cours',
          secondary: 'Contactez-nous',
        },
      },
      title: "Cours de trading",
      states: {
        loading: "Chargement…",
        empty: "Aucun cours pour le moment."
      },
      errors: {
        load_failed: "Échec du chargement des cours"
      },
      levels: {
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé"
      },
      price: {
        usd: "USD {{value}}",
        usdt: "USDT {{value}}"
      },
      checkout: {
        title: "Paiement",
        subtitle: "Validez votre inscription avec des moyens de paiement rapides et flexibles.",
        free: "Gratuit",
        no_tier: "Aucun niveau de cours sélectionné. Revenez en arrière et choisissez un cours.",
        customer: {
          details: "Informations client",
          full_name: "Nom complet",
          email: "E-mail",
          country: "Pays/Région",
          pref_lang: "Langue du cours préférée"
        },
        lang: { "en": "Anglais", "ar": "Arabe", "fr": "Français" },
        placeholders: {
          name: "Votre nom",
          country: "Choisir un pays"
        },
        payment: {
          title: "Moyen de paiement",
          usdt: "USDT (TRC20)",
          libyana: "Solde Libyana",
          madar: "Solde Madar"
        },
        libyana: {
          title: "Payer avec le solde Libyana",
          instructions: "Envoyez le paiement au numéro suivant :",
          note: "Après le paiement, votre inscription sera confirmée par notre équipe."
        },
        madar: {
          title: "Payer avec le solde Madar",
          instructions: "Envoyez le paiement au numéro suivant :",
          note: "Après le paiement, votre inscription sera confirmée par notre équipe."
        },
        actions: {
          complete: "Finaliser l’achat",
          back: "Retour"
        },
        summary: {
          title: "Récapitulatif de la commande",
          course: "Cours",
          subtotal: "Sous-total",
          taxes: "Taxes",
          total: "Total"
        },
        benefits: {
          certificate: "Vous recevrez un certificat de réussite",
          lifetime: "Accès à vie à tous les niveaux",
          vipSignals: "+ notre groupe VIP de signaux Telegram",
          brokerBonus: "Rejoignez notre courtier certifié et profitez d’un bonus gratuit de 50–100 % sur vos dépôts"
        },
        modal: {
          title: "Détails du paiement",
          remaining: "Temps restant :",
          send_to: "Envoyez l’USDT (TRC20) à :",
          amount: "Montant (approx.) :",
          txid_prompt: "Saisissez le hash de transaction (TXID) après l’envoi de l’USDT.",
          txid_ph: "Hash de transaction",
          phone_prompt: "Saisissez le numéro de téléphone depuis lequel vous avez envoyé le solde.",
          status: "Statut actuel :",
          verifying: "Nous vérifions votre transaction. Cela peut prendre quelques minutes.",
          awaiting: "En attente d’une confirmation manuelle par un administrateur. Vous recevrez l’accès une fois vérifié.",
          close: "Fermer",
          paid: "J’ai payé"
        },
        errors: {
          txid_required: "Veuillez saisir le hash de transaction",
          phone_required: "Veuillez saisir le numéro de téléphone de l’expéditeur",
          proof_failed: "Échec de l’envoi de la preuve"
        }
      },
      footer: {
        tagline: "Améliorez vos compétences avec des cours pratiques et sélectionnés.",
        rights: "Tous droits réservés.",
        courses: "Cours",
        popular: "Populaire",
        new: "Nouveaux et tendances",
        bundles: "Packs et offres",
        about: "À propos",
        careers: "Carrières",
        press: "Presse",
        support: "Support",
        help: "Centre d'aide",
        contact: "Nous contacter",
        terms: "Conditions",
        connect: "Réseaux",
        newsletter: "Newsletter",
        social: "Réseaux sociaux",
        blog: "Blog",
        learn: "Apprendre",
        contact_us: "Nous contacter",
        faq: "FAQ",
        policy: "Politique de LDN",
        resources: "Ressources",
        company: "Entreprise",
        about_short: "À propos",
      },
      auth: {
        login: 'Se connecter',
        login_title: 'Bienvenue',
        login_subtitle: 'Accédez à des cours premium, à des signaux sélectionnés et à un support dédié',
        login_cta: 'Se connecter',
         no_account: 'Vous n\'avez pas de compte ?',
        join_us: 'Rejoignez LDN Trade',
        login_loading: 'Connexion…',
        login_error: 'Échec de la connexion',
        verify: 'Vérifier',
        open_whatsapp: 'Ouvrir WhatsApp',
        whatsapp_required: 'Votre numéro de téléphone doit être lié à WhatsApp pour recevoir le OTP.',
        forgot_password: 'Mot de passe oublié ?',
        remember_me: 'Se souvenir de moi',

        register: 'Créer un compte',
        register_title: 'Créez votre compte',
        register_error: 'Échec de l’inscription',
        registering: 'Inscription…',
        create_account: 'Créer le compte',
        already_have: 'Vous avez déjà un compte ?',
        have_account: 'Vous avez un compte ?',

        name: 'Nom',
        name_placeholder: 'Nom complet',
        email: 'E-mail',
        email_placeholder: 'vous@exemple.com',
        password: 'Mot de passe',
        password_placeholder: '8+ caractères',
        phone: 'Téléphone',
        phone_placeholder: 'Enter your number without country code',
        // register extras
        send_otp: 'Envoyer le code',
        otp_placeholder: 'Saisir le code',
        otp_sent: 'Code envoyé. Vérifiez votre téléphone.',
        otp_verify_failed: "Échec de la vérification du code",
        phone_verified: 'Téléphone vérifié.',
        phone_required: 'Veuillez saisir votre numéro de téléphone.',
        phone_verify_required: 'Veuillez vérifier votre téléphone via un code.',
        duplicate_email: 'E-mail déjà enregistré',
        error_underage: 'Vous devez avoir au moins 18 ans.',
        error_overage: 'Veuillez saisir une date de naissance valide.',
        show: 'Afficher',
        hide: 'Masquer',

        account_type: 'Type de compte',
        personal_account: 'Personnel',
        nationality: 'Nationalité',
        nationality_placeholder: 'e.g., Libya',
        business_account: 'Entreprise / Agence',
      },
      tooltip: {
        lightMode: 'Passer en mode clair',
        darkMode: 'Passer en mode sombre',
        logout: 'Se déconnecter',
      },
      aria: {
        toggleTheme: 'Changer de thème',
        logout: 'Se déconnecter',
      }
    }
  },

  ar: {
    translation: {
      brand: 'LDN Trade',
      nav: {
        search: 'بحث',
        enrolled: 'كورساتي',
        signIn: 'تسجيل الدخول',
        signOut: 'تسجيل الخروج',
        contact: 'اتصل بنا',
      },
      actions: {
        refresh: "تحديث",
        confirm: "تأكيد",
        view_details: "عرض التفاصيل",
        enroll: "اشترك",
        fail: "فشل",
        verify: "تحقق"
      },
      sections: {
        pending_payments: "المدفوعات المعلّقة",
        pending_users: "المستخدمون المعلّقون",
        pending_businesses: "الأنشطة التجارية المعلّقة"
      },
      statuses: {
        pending: "معلّق",
        confirmed: "مؤكّد",
        failed: "فاشل"
      },
      labels: {
        purchase_short_id: "{{id}}",
        user_line: "المستخدم: {{name}} ({{email}})",
        course_line: "الكورس: {{course}}",
        proof_line: "الإثبات: {{hash}}",
        created_at: "تم الإنشاء: {{date}}",
        owner_line: "المالك: {{owner}}",
        yes: "نعم",
        no: "لا",
        na: "غير متاح"
      },
      empty_states: {
        no_pending_payments: "لا توجد مدفوعات معلّقة.",
        no_pending_users: "لا يوجد مستخدمون معلّقون.",
        no_pending_businesses: "لا توجد أنشطة تجارية معلّقة."
      },
      forbidden: {
        title: "ممنوع",
        message: "يجب أن تكون مديرًا للوصول إلى هذه الصفحة."
      },
      common: {
        select: 'اختر',
        save: 'حفظ',
        upload: 'رفع',
        loading: 'جارٍ التحميل...',
        confirm: 'تأكيد',
        no_messages: 'لا توجد رسائل',
        refresh: 'تحديث',
        only_unread: 'فقط الرسائل غير المفروضة',
        show_all: 'عرض الكل',
        export_csv: 'تصدير إلى ملف CSV',
        course: 'كورس',
        message: 'رسالة',
        meta: 'البيانات',
        page: 'الصفحة',
        reply: 'رد',
        whatsapp: 'WhatsApp',
        show: 'عرض',
        reject: 'رفض',
        price: 'السعر',
        price_usdt: 'السعر (USDT)',
        price_stripe: 'السعر (Stripe بالسنت)',
        create: 'إنشاء',
        delete: 'حذف',
        prev: 'السابق',
        next: 'التالي',
        currency: 'العملة',
        expires_in: 'تاريخ انتهاء صلاحية السعر',
        expires_at: 'ينتهي في',
        title: 'العنوان',
        close: 'إغلاق',
        subtitle: 'العنوان الفرعي',
        note: 'ملاحظة',
        name: 'الاسم',
        origin: 'الانطلاق',
        destination: 'الوجهة',
        airline: 'الشركة',
        image_url: 'رابط الصورة',
        select_image: 'اختر صورة…',
        preview: 'معاينة',
        forbidden: 'ممنوع',
      },
      instructor: {
        name: 'اسم المدرّس',
        avatar_url: 'رابط الصورة الشخصية',
        bio: 'نبذة عن المدرّس',
        upload_photo: 'رفع صورة المدرّس',
      },
      course: {
        level: {
          beginner: 'مبتدئ',
          intermediate: 'متوسط',
          advanced: 'متقدم'
        }
      },
      social: {
        telegram_embed: 'رابط تضمين تيليغرام',
        telegram_join: 'رابط الانضمام لتيليغرام',
        discord_widget: 'معرّف ويدجت ديسكورد',
        discord_invite: 'رابط دعوة ديسكورد',
        twitter_timeline: 'رابط مخطط X/تويتر'
      },
      materials: {
        title: 'المواد',
        load: 'تحميل المواد',
        upload_pdf: 'رفع PDF',
        upload_video: 'رفع فيديو',
        none: 'لا توجد مواد محمّلة. اضغط "تحميل المواد".',
        staged_title: 'مواد (قيد الانتظار)',
        add_pdfs: 'إضافة ملفات PDF',
        add_videos: 'إضافة فيديوهات',
        files_selected: '{{count}} ملف/ملفات محددة',
        staged_note: 'سيتم رفع هذه الملفات وإرفاقها بعد الضغط على إنشاء.'
      },
      admin: {
        title: 'لوحة التحكم',
        subtitle: 'ادارة الموقع والخدمات',
        promos: 'العروض',
        jobs: 'الوظائف',
        applications: 'الطلبات',
        communications: 'التواصلات',
        comm: {
          search_ph: 'ابحث بالاسم أو البريد أو الرسالة…',
          status_read: 'مقروء',
          status_open: 'مفتوح',
          mark_unread: 'تعيين كغير مقروء',
          mark_read: 'تعيين كمقروء',
          ticket_id: 'التذكرة',
        },
        content: 'المحتوى',
        admin_overview: 'نظرة عامة',
        pending_transactions: 'العمليات المعلقة',
        banners: 'لافتات',
        quick_actions: 'إجراءات سريعة',
        revenue_over_time: 'الإيرادات عبر الزمن',
        traffic_conversions: 'الزيارات والتحويلات',
        purchase_status_breakdown: 'تفصيل حالات الشراء',
        revenue_split: 'تقسيم الإيرادات',
        top_courses_revenue: 'أعلى الكورسات إيراداً',
        course_views_sales: 'مشاهدات الكورس مقابل المبيعات',
        verifications: 'التحقق',
        analytics: 'تحليلات',
        create_content: 'إنشاء محتوى',
        create_banner: 'إنشاء لافتة',
        trailer_url: 'رابط المقدّمة',
        preview_url: 'رابط المعاينة',
        upload_trailer: 'رفع المقدّمة (فيديو)',
        upload_preview: 'رفع المعاينة (فيديو)',
        course_tiers: 'مستويات الكورس',
        pending_users: 'المستخدمين المعلقين',
        pending_businesses: 'المؤسسات المعلقة',
        pending_payments: 'المدفوعات المعلقة',
        pending_usdt: 'USDT المعلّق',
        pending_balance: 'الرصيد المعلّق',
        overview: 'نظرة عامة',
        view: 'عرض',
        must_be_admin: 'يجب أن تكون مديرًا لعرض هذه الصفحة.'
      },
      header: {
        hi: 'مرحباً، {{name}}',
        dashboard: 'لوحة التحكم',
        account: 'حسابي',
        cart: 'السلة',
        emptyCart: 'السلة فارغة',
        clearCart: 'مسح السلة',
        close: 'إغلاق',
      },
      contact: {
        title: "اتصل بنا",
        subtitle: "أرسل لنا رسالة وسنعاود التواصل معك قريبًا.",
        name: "الاسم",
        name_ph: "الاسم الكامل",
        email: "البريد الإلكتروني",
        email_ph: "you@example.com",
        course: "الكورس (اختياري)",
        course_ph: "اختر كورس",
        course_fallback: "كورس",
        message: "الرسالة",
        message_ph: "اخبرنا بما تحتاجه بالتفصيل...",
        send: "إرسال الرسالة",
        sent: "تم إرسال رسالتك. سنعاود التواصل معك قريبًا.",
        error_send: "تعذر إرسال الرسالة",
        validation_required: "يرجى تعبئة جميع الحقول المطلوبة.",
        alt: "تفضّل واتساب أو تيليجرام؟",
        whatsapp: "واتساب",
        telegram: "تيليجرام",
        default_text: "مرحبًا، أود معرفة المزيد عن كورساتكم.",
        course_id: "معرّف الكورس",
        toast_sent_title: "تم إرسال الرسالة",
        toast_sent_desc: "سنتواصل معك قريبًا."
      },
      checkout: {
        title: "الدفع",
        subtitle: "أكمِل تسجيلك بطرق دفع سريعة ومرنة.",
        free: "مجاني",
        no_tier: "لم يتم اختيار باقة الكورس. عُد واختر كورس.",
        customer: {
          details: "بيانات العميل",
          full_name: "الاسم الكامل",
          email: "البريد الإلكتروني",
          country: "الدولة/المنطقة",
          pref_lang: "لغة الكورس المفضلة"
        },
        lang: { en: "الإنجليزية", ar: "العربية", fr: "الفرنسية" },
        placeholders: {
          name: "اسمك",
          country: "اختر الدولة"
        },
        payment: {
          title: "طريقة الدفع",
          usdt: "USDT (TRC20)",
          libyana: "رصيد ليبيانا",
          madar: "رصيد المدار"
        },
        libyana: {
          title: "الدفع عبر رصيد ليبيانا",
          instructions: "أرسل المبلغ إلى الرقم التالي:",
          note: "بعد الدفع سيتم تأكيد اشتراكك من فريقنا."
        },
        madar: {
          title: "الدفع عبر رصيد المدار",
          instructions: "أرسل المبلغ إلى الرقم التالي:",
          note: "بعد الدفع سيتم تأكيد اشتراكك من فريقنا."
        },
        actions: {
          complete: "إتمام الشراء",
          back: "رجوع"
        },
        summary: {
          title: "ملخص الطلب",
          course: "الكورس",
          subtotal: "الإجمالي قبل الضريبة",
          taxes: "الضرائب",
          total: "الإجمالي"
        },
        benefits: {
          certificate: "ستحصل على شهادة إنجاز",
          lifetime: "وصول مدى الحياة إلى جميع الباقات",
          vipSignals: "+ الانضمام إلى مجموعة إشارات تيليجرام VIP",
          brokerBonus: "انضم إلى وسيطنا المعتمد واستمتع ببونص مجاني 50–100% على إيداعاتك"
        },
        modal: {
          title: "تفاصيل الدفع",
          remaining: "الوقت المتبقي:",
          send_to: "أرسل USDT (TRC20) إلى:",
          amount: "القيمة (تقريباً):",
          txid_prompt: "أدخل معرّف العملية (TXID) بعد إرسال USDT.",
          txid_ph: "معرّف العملية",
          phone_prompt: "أدخل رقم الهاتف الذي أرسلت منه الرصيد.",
          status: "الحالة الحالية:",
          verifying: "نقوم بالتحقق من معاملتك. قد يستغرق ذلك بضع دقائق.",
          awaiting: "بانتظار تأكيد يدوي من المشرف. ستصلك الصلاحية بعد التحقق.",
          close: "إغلاق",
          paid: "تم الدفع"
        },
        errors: {
          txid_required: "يرجى إدخال معرّف العملية",
          phone_required: "يرجى إدخال رقم هاتف المُرسل",
          proof_failed: "تعذّر إرسال الإثبات"
        }
      },
      dashboard: {
        title: 'لوحة التحكم',
        subtitle: 'إدارة الكورسات والحساب',
        available: 'متاح',
        communications: "الرسائل",
        pending_transactions: 'العمليات المعلقة',
        active_learning: 'تعلم نشط',
        all_time: 'إجمالي',
        overview: 'نظرة عامة',
        total_revenue: 'إجمالي الإيرادات',
        users: 'المستخدمون',
        site_views: 'مشاهدات الموقع',
        sessions_purchase: 'الجلسات → شراء',
        session_conversion: 'تحويل الجلسات',
        signup_buyer: 'تسجيل → مشتري',
        lead_conversion: 'تحويل العملاء المحتملين',
        arpu_aov: 'متوسط العائد/المستخدم • متوسط قيمة الطلب',
        avg_rev_user_aov: 'متوسط العائد/المستخدم • AOV',
        usdt_stripe: 'USDT + سترايب',
        pending_over_time: 'العمليات المعلّقة عبر الزمن',
        purchase_id: 'المعرّف',
        user: 'المستخدم',
        tier: 'المستوى',
        pending: 'معلّق',
        proof: 'الإثبات',
        id: 'المعرّف',
        email: 'البريد الإلكتروني',
        name: 'الاسم',
        courses: 'كورساتي',
        account: 'الحساب',
        admin: 'إدارة',
        purchases: 'المشتريات',
        settings: 'الإعدادات',
        language: 'اللغة',
        total_courses: 'إجمالي الكورسات',
        enrolled: 'الملتحق بها',
        no_courses: 'لست ملتحقاً بأي كورس بعد.',
        continue: 'متابعة',
        no_purchases: 'لا توجد مشتريات بعد.',
        open: 'فتح',
        settings_hint: 'استخدم عناصر الرأس لتغيير اللغة. المزيد من الإعدادات قريباً.'
      },
      account: {
        title: 'حسابي',
        subtitle: 'تفاصيل الملف الشخصي وإعدادات الحساب',
      },
      learn: {
        loading: "جارٍ تحميل الكورس...",
        course_fallback: "الكورس",
        actions: {
          mark_completed: "اتممت الكورس",
          my_courses: "كورساتي"
        },
        completion: {
          marked: "تم الإنتهاء"
        },
        reviews: {
          title: "المراجعات",
          loading: "جارٍ تحميل المراجعات…",
          leave: "ترك مراجعة",
          submit: "إرسال المراجعة",
          rating_required: "التقييم مطلوب",
          thanks: "شكراً على مراجعتك!",
          submit_failed: "فشل في إرسال المراجعة",
          comment_placeholder: "اكتب مراجعتك هنا...",
          verified: "مُوثوق",
          empty: "لا توجد مراجعات بعد."
        },
        certificate: {
          get: "الحصول على الشهادة",
          share: "مشاركة الشهادة",
          download: "تحميل الشهادة",
          preview: "عرض الشهادة",
          copy: "نسخ الرابط",
          copied: "تم نسخ الرابط"
        },
        instructor: {
          title: "المدرّس"
        },
        materials: {
          title: "مواد الكورس",
          preview: "فيديو تمهيدي",
          trailer: "المقدمة",
          telegram: "مجموعة تيليغرام",
          discord: "ديسكورد",
          twitter: "تويتر",
          empty: "لا توجد مواد منشورة بعد."
        },
        documents: {
          title: "المستندات",
          loading: "جارٍ تحميل المستند…"
        },
        videos: {
          title: "الفيديوهات"
        },
        guard: {
          note: "تم تعطيل التنزيل. لا ننصح بالتقاط لقطات الشاشة."
        },
        support: {
          title: "تحتاج مساعدة؟",
          body: "إذا كنت تعتقد أن هذا الوصول عن طريق الخطأ، تواصل مع الدعم واذكر رقم عملية الشراء."
        },
        access: {
          title: "الوصول إلى الكورس",
          denied_fallback: "ليس لديك صلاحية للوصول إلى هذه الكورس.",
          back_to_my_courses: "العودة إلى كورساتي"
        },
        errors: {
          access_denied: "تم رفض الوصول. يجب أن تكون مسجلاً في الكورس.",
          load_failed: "فشل تحميل الكورس",
          complete_failed: "فشل تكتمل الكورس"
        },
        watermark: {
          user: "المستخدم: {{user}}"
        },
        capture: {
          title: "تم حظر لقطة الشاشة",
          body: "لحمايتك ولحماية هذه الكورس، يتم تقييد لقطات الشاشة والتسجيل.",
          pfp_blocked: "تم حظر اللقطة"
        }
      },
      home: {
        offers: 'عروض لوقت محدود',
        searching: 'جارٍ البحث...',
        form_note: 'إلغاء مجاني على بعض الأسعار المختارة',
        search: 'بحث',
        hero: {
          title: 'تعلم من نخبة المجال.',
          subtitle: 'برامجنا تساعدك لتحقق احلامك.',
          cta_primary: 'تصفح الكورسات',
          cta_secondary: 'استكشف المنهج',
        },
        trustpilot: {
          title: "موثوق من المتعلمين — والنتائج واضحة",
          badge: "موثق من Trustpilot",
          headline1: "موثق من Trustpilot",
          ratingText1: "ممتاز • 4.8 من 5",
          reviewsCount1: "أكثر من 1,200 مراجعة",
          proofText1: "طلاب حقيقيون. نتائج حقيقية.",
          headline2: "تقييم عالٍ من المتعلمين",
          ratingText2: "4.9/5 متوسط تقييم المدربين",
          reviewsCount2: "ضمن أفضل 1٪ في الفئة",
          proofText2: "تعليقات موثقة بشكل مستقل.",
          headline3: "موثوق في منطقة الشرق الأوسط وشمال أفريقيا وخارجها",
          ratingText3: "مجتمع عالمي من المتعلمين",
          reviewsCount3: "ينمو كل أسبوع",
          proofText3: "شفافية يمكنك الوثوق بها."
        },
        faq: {
          title: "الأسئلة الشائعة",
          subtitle: "ابحث عن إجابات سريعة أدناه. ما زلت محتارًا؟ تواصل معنا — يسعدنا مساعدتك.",
          items: [
            { q: "لمن هذه البرامج؟", a: "من المبتدئين إلى المتعلمين المتقدمين الباحثين عن تدريب منظم وهادف." },
            { q: "كيف يتم تقديم الكورسات؟", a: "من خلال مجموعات تعليمية مباشرة ودروس ذاتية الإيقاع مع دعم المجتمع وموارد قابلة للتنزيل." },
            { q: "هل سأحصل على شهادة؟", a: "نعم، ستحصل على شهادة إتمام يمكنك مشاركتها على لينكدإن." },
            { q: "هل يمكنني التجربة قبل الالتزام؟", "a": "نحن نقدم معاينات ودروسًا تجريبية حتى تتمكن من الاستكشاف قبل التسجيل." }
          ]
        },
        benefits: {
          title: 'اختبر رحلة تعلم فريدة',
          one: 'مناهج يقودها خبراء',
          one_desc: 'مسارات منظمة من الأساسيات حتى الاستراتيجيات المتقدمة.',
          two: 'دروس عملية',
          two_desc: 'مشاريع ودراسات حالة لنتائج واقعية.',
          three: 'مجتمع مميز',
          three_desc: 'إرشاد وفعاليات وقنوات خاصة.',
          four: 'الشريعة الإسلامية',
          four_desc: 'جميع الدروس تعلّم استراتيجيات مطابقة للشريعة الإسلامية.',
        },
        features: {
          title: 'ما الذي يميز كورساتنا',
          one: 'من الأساسيات إلى الاحتراف',
          one_desc: 'مسار واضح من المفاهيم حتى المنهجيات المتقدمة.',
          two: 'تعلم بنظام الدفعات',
          two_desc: 'تعلّم مع الزملاء وبإرشاد المدرّسين.',
          three: 'مكتبة موارد',
          three_desc: 'قوالب وقوائم تحقق و ملفات لا مثيل لها.',
          four: 'شهادة إتمام',
          four_desc: 'اعرض إنجازك عند التخرج.',
        },
        courses: {
          title: 'كورسات مميزة',
          cta: 'استعرض المنهج',
          view: 'ابداء الكورس',
        },
        cta: {
          kicker: 'جاهز للتعلّم؟',
          title: 'ابدأ رحلتك التعليمية اليوم',
          subtitle: 'انضم إلى متعلمين حول العالم وادخل مكتبتنا المميزة.',
          primary: 'تصفح الكورسات',
          secondary: 'اتصل بنا',
        },
      },
      title: "كورسات التداول",
      states: {
        loading: "جاري التحميل…",
        empty: "لا توجد كورسات حتى الآن."
      },
      errors: {
        load_failed: "فشل في تحميل الكورسات"
      },
      levels: {
        beginner: "مبتدئ",
        intermediate: "متوسط",
        advanced: "متقدم"
      },
      price: {
        usd: "دولار أمريكي {{value}}",
        usdt: "USDT {{value}}"
      },
      features: {
        title: 'لماذا نحن',
        pricing: {
          title: 'ضمان أفضل الأسعار',
          desc: 'وجدت سعراً أقل؟ سنطابقه ونمنحك خصماً إضافياً 5%'
        },
        support: {
          title: 'دعم مميز على مدار الساعة',
          desc: 'مستشارو سفر خبراء متاحون طوال اليوم'
        },
        rewards: {
          title: 'برنامج مكافآت النخبة',
          desc: 'اكسب نقاطاً مع كل حجز واحصل على مزايا حصرية'
        }
      },
      footer: {
        tagline: 'تعلم مهاراتك مع برامج مصممة لتحويل الطموح إلى خبرة.',
        rights: 'جميع الحقوق محفوظة.',
        courses: 'الكورسات',
        popular: 'كورسات شهيرة',
        new: 'الجديد والشائع',
        bundles: 'العروض',
        careers: 'الوظائف',
        press: 'الصحافة',
        support: 'الدعم',
        help: 'مركز المساعدة',
        contact: 'اتصل بنا',
        terms: 'الشروط',
        connect: 'تواصل',
        newsletter: 'النشرة البريدية',
        social: 'وسائل التواصل الاجتماعي',
        blog: 'المدونة',
        learn: 'تعلم',
        faq: 'الأسئلة الشائعة',
        policy: 'سياستنا',
        resources: 'الموارد',
        contact_us: 'اتصل بنا',
        company: 'شركة',
        about: 'عننا',
      },
      auth: {
        login: 'تسجيل الدخول',
        login_title: 'مرحباً بعودتك',
        login_subtitle: 'ادخل للوصول إلى أفضل الكورسات، اشارات تداول ممتازة ودعم مخصص',
        login_cta: 'تسجيل الدخول',
        no_account: 'ليس لديك حساب؟',
        join_us: 'انضم إلى LDN Trade',
        login_loading: 'جارٍ تسجيل الدخول…',
        login_error: 'فشل تسجيل الدخول',
        verify: 'تحقق',
        open_whatsapp: 'فتح WhatsApp',
        whatsapp_required: 'رقم هاتفك يجب أن يكون مرتبطاً بـ WhatsApp لاستلام رمز التحقق.',
        forgot_password: 'نسيت كلمة المرور؟',
        remember_me: 'تذكرني',

        register: 'إنشاء حساب',
        register_title: 'أنشئ حسابك',
        register_error: 'فشل إنشاء الحساب',
        registering: 'جارٍ إنشاء الحساب…',
        create_account: 'إنشاء حساب',
        already_have: 'لديك حساب بالفعل؟',
        have_account: 'لديك حساب؟',

        name: 'الاسم',
        name_placeholder: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        email_placeholder: 'you@example.com',
        password: 'كلمة المرور',
        password_placeholder: '٨ أحرف أو أكثر',
        phone: 'رقم الهاتف',
        phone_placeholder: 'ادخل رقم هاتفك بدون كود البلاد',

        account_type: 'نوع الحساب',
        send_otp: 'إرسال رمز التحقق',
        otp_sent: 'تم إرسال رمز التحقق',
        otp_placeholder: 'أدخل رمز التحقق',
        verified: 'تم التحقق',
        personal_account: 'شخصي',
        nationality: 'الجنسية',
        nationality_placeholder: 'الرجاء اختيار الجنسية',
        business_account: 'وكالة / أعمال',
      },
      tooltip: {
        lightMode: 'الوضع الفاتح',
        darkMode: 'الوضع الداكن',
        logout: 'تسجيل الخروج',
      },
      aria: {
        toggleTheme: 'تبديل السمة',
        logout: 'تسجيل الخروج',
      }
    }
  }
};

/**
 * NEW PAGE STRINGS (Learn, Legal, Company)
 * These are merged into the same "translation" namespace so you don’t
 * have to change any provider config. Safe alongside your current keys.
 */
const NEW_PAGE_STRINGS = {
  en: {
    translation: {
      common: {
        view: "View",
        explore: "Explore",
        downloads: "Downloads",
        read_more: "Read more",
        enroll_now: "Enroll now",
        free: "Free",
        anonymous: "Student",
      },
      learn: {
        resources: {
          title: "Learning Resources",
          subtitle:
            "Premium guides, checklists, and video breakdowns to accelerate your progress.",
          guides: "Step-by-Step Guides",
          guides_desc:
            "Structured playbooks from fundamentals to advanced strategies.",
          videos: "Video Library",
          videos_desc:
            "Concise lessons and deep-dives with real market examples.",
          downloads: "Downloads",
          downloads_desc: "Checklists, templates, and ready-to-use tools.",
          research: "Research Notes",
          research_desc: "Curated notes and frameworks used by our mentors.",
          pitch:
            "Get the exact curriculum our mentors use with real-world scenarios, practical downloads, and actionable frameworks. Start free, upgrade anytime.",
          guarantee: "Mentor-reviewed",
          guarantee_value: "Actionable & vetted",
          time_to_complete: "Avg. completion",
          time_value: "2–6 weeks",
          image_alt: "Students learning with structured course content",
          point1:
            "Practical, not theoretical: real examples and step-by-step walkthroughs.",
          point2: "Cohort access & weekly Q&A with mentors.",
          point3: "Lifetime updates to materials.",
          point4: "Certificate of completion to showcase your skills.",
          syllabus: "Course Syllabus (Preview)",
          module1: "Foundations & Mindset",
          module2: "Core Strategies & Risk",
          module3: "Tools, Templates & Automation",
          module4: "Case Studies & Live Reviews",
          testimonials_title: "Loved by learners",
          testimonial1:
            "The content is gold. I moved from guessing to having a plan.",
          testimonial2:
            "Clear, concise, and practical. The templates saved me weeks.",
          testimonial3:
            "I finally understand the why behind decisions.",
          role1: "Entrepreneur",
          role2: "Analyst",
          role3: "Student",
          cta_banner:
            "Ready to go deeper? Join the full course and get all resources unlocked.",
        },
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know before you enroll.",
          q1: "How long do I keep access?",
          a1: "Lifetime access to the content and future updates.",
          q2: "Do I get a certificate?",
          a2: "Yes, a downloadable certificate upon completion.",
          q3: "Is there support?",
          a3: "24/7 support via chat and priority email.",
        },
      },
      legal: {
        refund: {
          title: "Refund Policy",
          p1: "If you’re not satisfied within 7 days of purchase, contact support for a full refund (terms apply).",
          p2: "Refunds exclude cases of content misuse, sharing, or policy abuse.",
          p3: "To initiate a refund, email support with your order ID and reason.",
          eligibility: "Eligibility: first-time purchase of a given product/tier, and meaningful usage under fair-use limits.",
          exclusions: "Exclusions: content scraping/sharing, downloading a substantial portion of materials, account sharing, or policy abuse.",
          digital: "Because access is digital, refunds may be prorated or denied if significant content has been consumed.",
          method: "Refunds are issued in USDT to the original network used for payment. Network fees are non-refundable.",
          timeline: "Processing time: up to 10 business days after approval, excluding on-chain network delays.",
          process: "To initiate a refund, email support with your order ID, wallet address, and reason."
        },
        terms: {
          title: "Terms & Conditions",
          last_updated: "Oct 8, 2025",
          intro:
            "By using this platform, enrolling in our courses, or purchasing digital content, you agree to these terms and conditions. Please read them carefully before proceeding.",
          scope: {
            title: "Scope",
            p1: "These terms govern your use of our educational services, courses, subscriptions, and community access focused on forex and crypto trading education.",
            p2: "All content provided is for educational purposes only and does not constitute financial or investment advice."
          },
          use: {
            title: "Use of Content & Intellectual Property",
            p1: "You are granted a personal, non-transferable, limited license to access and use our educational materials. You may not share, resell, distribute, or publicly display our content without written permission.",
            p2: "All course videos, PDFs, and templates are copyrighted material. Unauthorized use may result in account termination and legal action."
          },
          conduct: {
            title: "User Conduct",
            p1: "You agree not to misuse the platform, engage in fraudulent activity, share your account, or attempt to gain unauthorized access to our systems.",
            p2: "We reserve the right to suspend or terminate accounts involved in content piracy, abusive behavior, or any activity that compromises platform integrity."
          },
          payments: {
            title: "Payments & Refunds",
            p1: "All payments are processed exclusively in USDT. Please review our Refund Policy for detailed terms on eligibility and processing times.",
            p2: "You are responsible for verifying payment addresses and network selection before sending crypto transactions."
          },
          disclaimer: {
            title: "Risk Disclosure & Educational Purpose",
            p1: "Trading forex, cryptocurrencies, and financial markets involves significant risk. Past performance does not guarantee future results.",
            p2: "Our courses, templates, and examples are purely educational and do not constitute financial advice, trading recommendations, or investment guidance.",
            p3: "You acknowledge that you are solely responsible for any trading decisions made based on information from our materials."
          },
          liability: {
            title: "Limitation of Liability",
            p1: "We are not liable for any losses, damages, or claims arising from your use of our platform or the application of our educational content.",
            p2: "All information is provided 'as is' without warranties of accuracy, completeness, or fitness for purpose."
          },
          modifications: {
            title: "Changes to Terms",
            p1: "We may update these terms periodically to reflect new features, laws, or business practices. Continued use after updates implies acceptance."
          }
        },
        payments: {
          usdt_only: "We only accept USDT for now as we want to offer the fastest and most trusted crypto for payments and to get our students involved in the crypto space early on. Please bear with us as we expand our payments offerings.",
          nb: "NB: We only accept TRC20 to minimise fees on our students and we do require a tx hash upon payment completion to verify each payment. Thank you for your cooperation."
        },
        privacy_refund: {
          title: "Privacy & Refund Policy",
          last_updated: "Oct 8, 2025",
          intro: "This policy explains how we handle your data and how refunds work for our educational products and subscriptions focused on forex and crypto trading.",
          scope: {
            title: "Scope",
            p1: "These terms apply to all courses, live sessions, templates, and membership tiers available on our platform.",
            p2: "Financial markets are risky. We provide education only—no investment advice, signals, or portfolio management."
          },
          payments: {
            title: "Payments & Pricing (USDT Only)",
            p1: "All sales are processed exclusively in USDT. Where supported, we accept USDT on TRC20 network only.",
            li1: "Prices may be displayed in your local currency for convenience, but settlement is in USDT.",
            li2: "Network fees and on-chain confirmation times are outside our control.",
            li3: "You are responsible for sending the exact amount to the correct chain address. Mis-sent funds may be irrecoverable.",
            note: "Note",
            note_text: "Payment confirmations occur after sufficient on-chain confirmations."
          },
          access: {
            title: "Access, Renewals & Cancellations",
            li1: "Access to digital content is personal and non-transferable.",
            li2: "Subscriptions renew automatically unless cancelled before the next billing date.",
            li3: "Cancellation stops future charges; it does not retroactively refund prior periods."
          },
          chargebacks: {
            title: "Chargebacks & Disputes",
            p1: "Please contact us first to resolve billing or access issues. Unauthorized disputes may result in account suspension."
          }
        },
        privacy: {
          data: {
            title: "Privacy: Data We Collect",
            account: "Account data: name, email, and login identifiers.",
            billing: "Billing metadata: transaction IDs, wallet address, and plan details (no private keys are ever collected).",
            usage: "Usage analytics: page views, progress, device information, and approximate location (for fraud prevention and product improvement)."
          },
          use: {
            title: "How We Use Your Data",
            provide: "To provide and improve course content, track progress, and deliver support.",
            security: "To protect against fraud, abuse, and unauthorized sharing.",
            comms: "To send essential service emails. You can opt out of non-essential marketing messages."
          },
          cookies: {
            title: "Cookies, Analytics & Third-Party Services",
            p1: "We use cookies and similar technologies for authentication, preferences, and analytics. Some third-party providers may process limited personal data according to their own policies."
          },
          security: {
            title: "Data Retention & Security",
            retention: "We retain data only as long as necessary for the purposes described or as required by law.",
            measures: "We apply technical and organizational safeguards, but no method is 100% secure."
          },
          rights: {
            title: "Your Rights",
            p1: "Subject to local laws, you may request access, correction, deletion, or portability of your data. We may ask for verification before fulfilling requests."
          }
        },
        common: {
          last_updated: "Last updated",
          contact: "Contact",
          contact_text: "For privacy questions or refund requests, reach us at ",
          support_email: "support@ldnprime.com",
          disclaimer: "Nothing here is financial advice. Trading involves substantial risk of loss. Educational content is provided as-is without guarantees."
        }
      },
      errors: {
        404: {
          title: "Page not found",
          subtitle: "The page you’re looking for isn’t available, or our servers had a brief hiccup.",
          code: "Error",
          trace: "Trace ID",
          cta_home: "Go to Home",
          cta_retry: "Try Again",
          cta_support: "Contact Support",
          helper: "If this keeps happening, include the error code or trace ID when contacting support."
        }
      },
      company: {
        about: {
          title: "From one desk to a movement",
          body: "In 2020, a single trader began sharing notes and trade reviews—teaching sharpened execution and revealed a bigger purpose. By 2021, a small team of developers, analysts, and mentors formed, replacing improvisation with systems. In 2022, the first structured curriculum was born, blending technical precision with the rhythm of real markets. 2023 proved the method’s power as consistency and data spoke louder than claims. By 2024, our own ecosystem united education, analytics, and mentorship under one roof. Today, in 2025, what began as one desk has grown into a global network—a movement helping traders pursue freedom through structure, discipline, and conviction.",
          more: {
            title: "…and the story continues",
            subtitle: "Every year brings new tools, stronger mentorship, and a growing community of disciplined traders building real results."
          },
          cta: {
            title: "Join the next chapter",
            subtitle: "Learn, trade, and grow with the system built by traders who’ve lived it—responsibly, consistently, and together."
          }
        },
        timeline: {
        "2020": {
          title: "From trader to teacher",
            desc:
              "What began as one trader’s daily routine turns into shared notes and live reviews. Teaching sharpens execution and reveals a bigger mission.",
          },
          "2021": {
            title: "A team forms",
            desc:
              "Developers, analysts, and mentors join. Systems replace improvisation. The foundation for a structured company starts taking shape.",
          },
          "2022": {
            title: "The first blueprint",
            desc:
              "Every process documented, every setup codified. The company’s first curriculum blends technical precision with real-world trading flow.",
          },
          "2023": {
            title: "Proof through results",
            desc:
              "Traders trained under the system show measurable consistency. Data replaces anecdotes, and the brand gains industry credibility.",
          },
          "2024": {
            title: "Building the ecosystem",
            desc:
              "An integrated platform launches—analytics, education, and mentorship under one roof. The focus: scalable growth and transparency.",
          },
          "2025": {
            title: "A movement, not just a firm",
            desc:
              "From a single desk to a global network. A company teaching financial freedom through structure, discipline, and shared conviction.",
          },
        },
        careers: {
          title: "Careers",
          subtitle:
            "Join a product-driven team building world-class trading education.",
          type: {
            fulltime: "Full-time",
            parttime: "Part-time",
            contract: "Contract",
          },
          apply: {
            title: "Apply",
            subtitle: "Submit your application for this role. We respect your time and review every submission carefully.",
            loading: "Loading…",
            role_overview: "Role overview",
            requirements: "Requirements",
            application: "Application",
            closes: "Closes",
            form: {
              name: "Name",
              name_ph: "Your full name",
              email: "Email",
              email_ph: "you@example.com",
              phone: "Phone",
              phone_ph: "+218…",
              cover: "Cover Letter",
              cover_ph: "Tell us why you’re a great fit…",
              cover_hint: "Optional but recommended.",
              cv: "CV (PDF/DOC)",
              cv_hint: "Accepted: PDF, DOC, DOCX"
            },
            submit: "Submit Application",
            submit_loading: "Submitting…",
            privacy: "We store your application securely and only use it to evaluate your candidacy.",
            toast: {
              ok_title: "Application submitted",
              ok_desc: "Thank you! We’ll be in touch soon.",
              error_title: "Submission failed"
            },
            errors: {
              missing_id: "Missing job id",
              not_found: "Job not found",
              load_failed: "Failed to load job",
              required: "Please fill all required fields and attach your CV.",
              submit_failed: "Failed to submit application."
            }
          },
          location: { remote: "Remote" },
        },
      },
    },
  },

    ar: {
    translation: {
      common: {
        view: "عرض",
        explore: "استكشف",
        downloads: "تحميلات",
        read_more: "قراءة المزيد",
        enroll_now: "ابدأ الآن",
        free: "مجاني",
        anonymous: "طالب",
      },
      learn: {
        resources: {
          title: "موارد التعلّم",
          subtitle: "أدلة احترافية وقوائم فحص وفيديوهات تفصيلية لتسريع تقدّمك.",
          guides: "أدلة خطوة بخطوة",
          guides_desc: "خطط عملية من الأساسيات إلى الاستراتيجيات المتقدمة.",
          videos: "مكتبة الفيديو",
          videos_desc: "دروس موجزة وتعمّقات بأمثلة من السوق الحقيقي.",
          downloads: "ملفات للتحميل",
          downloads_desc: "قوائم فحص، قوالب، وأدوات جاهزة للاستخدام.",
          research: "مذكرات بحثية",
          research_desc: "ملاحظات وأطر عمل منتقاة يستخدمها المدربون لدينا.",
          pitch:
            "احصل على المنهج الذي يستخدمه مدربونا مع سيناريوهات واقعية وأطر قابلة للتطبيق. ابدأ مجانًا، وطوّر لاحقًا.",
          guarantee: "مراجَع من المدربين",
          guarantee_value: "عملي وقابل للتطبيق",
          time_to_complete: "متوسط الإتمام",
          time_value: "2–6 أسابيع",
          image_alt: "طلاب يتعلّمون عبر منهج منظم",
          point1: "تطبيقي لا نظري: أمثلة حقيقية وخطوات واضحة.",
          point2: "وصول لدفعات تعلّم وجلسات أسئلة وأجوبة أسبوعية.",
          point3: "تحديثات مدى الحياة للمواد.",
          point4: "شهادة إتمام لإبراز مهاراتك.",
          syllabus: "الخطة الدراسية (معاينة)",
          module1: "الأساسيات والعقلية",
          module2: "الاستراتيجيات الأساسية وإدارة المخاطر",
          module3: "الأدوات والقوالب والأتمتة",
          module4: "دراسات حالة ومراجعات مباشرة",
          testimonials_title: "محبوب من المتعلمين",
          testimonial1: "المحتوى ذهبي. انتقلت من التخمين إلى خطة واضحة.",
          testimonial2: "واضح وموجز وعملي. القوالب وفّرت عليّ أسابيع.",
          testimonial3: "أخيرًا فهمت سبب القرارات وليس فقط كيفيتها.",
          role1: "رائد أعمال",
          role2: "محلل",
          role3: "طالب",
          cta_banner:
            "جاهز للتعمّق؟ انضم إلى الكورسات الكاملة وافتح جميع الموارد.",
        },
        faq: {
          title: "الأسئلة الشائعة",
          subtitle: "كل ما تحتاج معرفته قبل الالتحاق.",
          q1: "ما مدة الوصول إلى المحتوى؟",
          a1: "وصول مدى الحياة للمحتوى والتحديثات المستقبلية.",
          q2: "هل أحصل على شهادة؟",
          a2: "نعم، شهادة قابلة للتنزيل بعد إتمام الكورس.",
          q3: "هل يتوفر دعم؟",
          a3: "دعم على مدار الساعة عبر الدردشة والبريد الإلكتروني.",
        },
      },
       errors: {
        404: {
          title: "الصفحة غير موجودة",
          subtitle: "الصفحة التي تبحث عنها غير متاحة، أو حدث خلل مؤقت في الخادم.",
          code: "رمز الخطأ",
          trace: "معرّف التتبّع",
          cta_home: "العودة للصفحة الرئيسية",
          cta_retry: "إعادة المحاولة",
          cta_support: "الاتصال بالدعم",
          helper: "إذا استمرت المشكلة، يرجى تضمين رمز الخطأ أو معرّف التتبّع عند التواصل مع الدعم."
        }
      },
      legal: {
        refund: {
          title: "سياسة الاسترداد",
          p1: "إذا لم تكن راضيًا خلال 7 أيام من الشراء، تواصل مع الدعم لاسترداد كامل (تسري الشروط).",
          p2: "لا يشمل الاسترداد إساءة استخدام المحتوى أو مشاركته أو مخالفة السياسات.",
          p3: "لبدء الاسترداد، أرسل رسالة إلى الدعم مع رقم الطلب والسبب.",
          eligibility: "الأهلية: الشراء الأول لمنتج/مستوى معيّن مع استخدام معقول ضمن حدود الاستخدام العادل.",
          exclusions: "الاستثناءات: نسخ/مشاركة المحتوى، تنزيل نسبة كبيرة من المواد، مشاركة الحساب، أو إساءة السياسات.",
          digital: "نظرًا لأن الوصول رقمي، قد يكون الاسترداد جزئيًا أو مرفوضًا إذا تم استهلاك جزء كبير من المحتوى.",
          method: "يتم الاسترداد بـ USDT إلى نفس الشبكة المستخدمة للدفع. رسوم الشبكة غير قابلة للاسترداد.",
          timeline: "مدة المعالجة: حتى 10 أيام عمل بعد الموافقة، باستثناء تأخيرات الشبكة.",
          process: "لبدء الاسترداد، أرسل بريدًا إلى الدعم يتضمن رقم الطلب، عنوان المحفظة، والسبب."
        },
        terms: {
          title: "الشروط والأحكام",
          last_updated: "8 أكتوبر 2025",
          intro:
            "باستخدامك لهذه المنصّة أو التحاقك بدوراتنا أو شرائك لمحتوى رقمي، فإنك توافق على هذه الشروط والأحكام. يُرجى قراءتها بعناية قبل المتابعة.",
          scope: {
            title: "النطاق",
            p1: "تحكم هذه الشروط استخدامك لخدماتنا التعليمية والدورات والاشتراكات والوصول إلى المجتمع، والمركّزة على تعليم تداول الفوركس والعملات المشفّرة.",
            p2: "جميع المحتويات المقدَّمة لأغراض تعليمية فقط ولا تُعد نصيحة مالية أو استثمارية."
          },
          use: {
            title: "استخدام المحتوى وحقوق الملكية الفكرية",
            p1: "يُمنح لك ترخيص شخصي غير قابل للتحويل ومحدود للوصول إلى موادنا التعليمية واستخدامها. لا يجوز لك مشاركة أو إعادة بيع أو توزيع أو عرض محتوياتنا علنًا دون إذن كتابي.",
            p2: "جميع مقاطع الفيديو والملفات والقوالب مواد محمية بحقوق الملكية. قد يؤدي الاستخدام غير المصرّح به إلى إيقاف الحساب واتخاذ إجراءات قانونية."
          },
          conduct: {
            title: "سلوك المستخدم",
            p1: "تتعهد بعدم إساءة استخدام المنصّة أو القيام بأي نشاط احتيالي أو مشاركة حسابك أو محاولة الوصول غير المصرّح به إلى أنظمتنا.",
            p2: "نحتفظ بحق تعليق أو إنهاء الحسابات المتورّطة في قرصنة المحتوى أو السلوك المسيء أو أي نشاط يهدد سلامة المنصّة."
          },
          payments: {
            title: "المدفوعات وسياسة الاسترداد",
            p1: "تُعالَج جميع المدفوعات حصريًا بـ USDT. يُرجى مراجعة سياسة الاسترداد لدينا لمعرفة شروط الأهلية وأوقات المعالجة.",
            p2: "أنت مسؤول عن التحقق من عناوين الدفع واختيار الشبكة قبل إرسال معاملات العملات المشفّرة."
          },
          disclaimer: {
            title: "إفصاح المخاطر والغرض التعليمي",
            p1: "ينطوي تداول الفوركس والعملات المشفّرة والأسواق المالية على مخاطر كبيرة. الأداء السابق لا يضمن النتائج المستقبلية.",
            p2: "دوراتنا وقوالبنا وأمثلتنا تعليمية بحتة ولا تُعد نصيحة مالية أو توصية تداول أو توجيهًا استثماريًا.",
            p3: "تقرّ بأنك المسؤول الوحيد عن أي قرارات تداول تتخذها استنادًا إلى المعلومات الواردة في موادنا."
          },
          liability: {
            title: "حدود المسؤولية",
            p1: "لسنا مسؤولين عن أي خسائر أو أضرار أو مطالبات تنشأ عن استخدامك لمنصّتنا أو تطبيق محتوياتنا التعليمية.",
            p2: "يُقدَّم جميع المعلومات 'كما هي' دون أي ضمانات بالدقة أو الاكتمال أو الملاءمة لغرض معيّن."
          },
          modifications: {
            title: "تغييرات على الشروط",
            p1: "قد نقوم بتحديث هذه الشروط دوريًا لتعكس ميزات جديدة أو متطلبات قانونية أو ممارسات عمل. يُعد استمرارك في الاستخدام بعد التحديثات موافقةً عليها."
          }
        },
        payments: {
          usdt_only: "نقبل USDT فقط حاليًا لأننا نرغب بتقديم أسرع وأكثر وسائل التشفير موثوقية للدفع ولإشراك طلابنا مبكرًا في عالم العملات المشفّرة. نرجو تحمّلكم ريثما نوسّع خيارات الدفع.",
          nb: "ملاحظة: نقبل شبكة TRC20 فقط لتقليل الرسوم على طلابنا، ونطلب تزويدنا بتجزئة المعاملة (tx hash) بعد إتمام الدفع للتحقق من كل عملية. شكرًا لتعاونكم."
        },
        privacy_refund: {
          title: "سياسة الخصوصية والاسترداد",
          last_updated: "8 أكتوبر 2025",
          intro: "توضح هذه السياسة كيفية تعاملنا مع بياناتك وكيف تعمل عمليات الاسترداد لمنتجاتنا التعليمية والاشتراكات الخاصة بتعليم الفوركس والعملات المشفّرة.",
          scope: {
            title: "النطاق",
            p1: "تنطبق هذه الشروط على جميع الدورات والجلسات المباشرة والقوالب والمستويات المتاحة على منصّتنا.",
            p2: "الأسواق المالية تنطوي على مخاطر. نحن نقدّم تعليمًا فقط — لا نصائح استثمارية أو إشارات أو إدارة محافظ."
          },
          payments: {
            title: "المدفوعات والتسعير (USDT فقط)",
            p1: "تُجرى جميع المبيعات حصريًا بـ USDT. حيثما أمكن، نقبل USDT على شبكة TRC20 فقط.",
            li1: "قد تُعرض الأسعار بعملتك المحلية للراحة، لكن التسوية النهائية تتم بـ USDT.",
            li2: "رسوم الشبكة وأوقات تأكيد المعاملات خارجة عن سيطرتنا.",
            li3: "أنت مسؤول عن إرسال المبلغ الصحيح إلى العنوان الصحيح على السلسلة الصحيحة. الأموال المرسلة بشكل خاطئ قد لا يمكن استرجاعها.",
            note: "ملاحظة",
            note_text: "يتم تأكيد الدفع بعد عدد كافٍ من التأكيدات على الشبكة."
          },
          access: {
            title: "الوصول، التجديد والإلغاء",
            li1: "الوصول إلى المحتوى الرقمي شخصي وغير قابل للتحويل.",
            li2: "تتجدّد الاشتراكات تلقائيًا ما لم تُلغ قبل تاريخ الفوترة التالي.",
            li3: "الإلغاء يوقف الرسوم المستقبلية ولا يوفّر استردادًا للفترات السابقة."
          },
          chargebacks: {
            title: "الاعتراضات والنزاعات",
            p1: "يرجى التواصل معنا أولًا لحل مشكلات الفوترة أو الوصول. قد يؤدي النزاع غير المصرّح به إلى تعليق الحساب."
          }
        },
        privacy: {
          data: {
            title: "الخصوصية: البيانات التي نجمعها",
            account: "بيانات الحساب: الاسم، البريد الإلكتروني، ومعرّفات الدخول.",
            billing: "بيانات الفوترة: معرفات المعاملات، عنوان المحفظة، وتفاصيل الخطة (لا نجمع المفاتيح الخاصة مطلقًا).",
            usage: "تحليلات الاستخدام: الصفحات التي تمت زيارتها، التقدّم، معلومات الجهاز، والموقع التقريبي (لمنع الاحتيال وتحسين المنتج)."
          },
          use: {
            title: "كيفية استخدام بياناتك",
            provide: "لتقديم وتحسين المحتوى التعليمي، تتبّع التقدّم، وتوفير الدعم.",
            security: "لحماية النظام من الاحتيال أو إساءة الاستخدام أو المشاركة غير المصرّح بها.",
            comms: "لإرسال رسائل الخدمة الأساسية. يمكنك إلغاء الاشتراك من الرسائل التسويقية غير الضرورية."
          },
          cookies: {
            title: "ملفات تعريف الارتباط والتحليلات والخدمات الخارجية",
            p1: "نستخدم ملفات تعريف الارتباط وتقنيات مشابهة للمصادقة والتفضيلات والتحليلات. قد تعالج بعض الجهات الخارجية بيانات شخصية محدودة وفقًا لسياساتها."
          },
          security: {
            title: "الاحتفاظ بالبيانات والأمان",
            retention: "نحتفظ بالبيانات فقط طالما كانت ضرورية للأغراض الموضحة أو كما يقتضيه القانون.",
            measures: "نطبّق تدابير تقنية وتنظيمية، لكن لا توجد وسيلة آمنة بنسبة 100٪."
          },
          rights: {
            title: "حقوقك",
            p1: "وفقًا للقوانين المحلية، يمكنك طلب الوصول أو التصحيح أو الحذف أو نقل بياناتك. قد نطلب التحقق قبل التنفيذ."
          }
        },
        common: {
          last_updated: "آخر تحديث",
          contact: "تواصل معنا",
          contact_text: "للاستفسارات حول الخصوصية أو طلبات الاسترداد، تواصل معنا عبر ",
          support_email: "support@ldnprime.com",
          disclaimer: "لا يُعد أي مما ورد هنا نصيحة مالية. التداول ينطوي على مخاطر كبيرة بالخسارة. يُقدَّم المحتوى التعليمي كما هو ودون أي ضمانات."
        }
      },
      company: {
        timeline: {
        "2020": {
            title: "من متداول إلى معلّم",
            desc:
              "ما بدأ كروتين يومي لمتداول واحد تحوّل إلى ملاحظات مشتركة ومراجعات مباشرة. التعليم صقل الأداء وكشف عن رسالة أوسع.",
          },
          "2021": {
            title: "تكوّن الفريق",
            desc:
              "انضم مطوّرون ومحلّلون وموجّهون. الأنظمة حلّت محل الارتجال. بدأت ملامح الشركة المنظمة تتكوّن.",
          },
          "2022": {
            title: "المخطط الأول",
            desc:
              "كل عملية موثّقة، وكل نموذج تداول محدد. أول منهج للشركة يجمع بين الدقّة التقنية وسير العمل الواقعي في الأسواق.",
          },
          "2023": {
            title: "الإثبات بالنتائج",
            desc:
              "المتداولون الذين تدرّبوا ضمن النظام حقّقوا ثباتًا ملحوظًا. البيانات حلّت محل القصص، واكتسبت العلامة ثقة في المجال.",
          },
          "2024": {
            title: "بناء المنظومة",
            desc:
              "إطلاق منصة متكاملة تجمع التحليل والتعليم والإرشاد في مكان واحد. الهدف: نمو قابل للتوسع وشفافية كاملة.",
          },
          "2025": {
            title: "حركة وليست مجرد شركة",
            desc:
              "من مكتب واحد إلى شبكة عالمية. شركة تزرع الحرية المالية عبر الانضباط، والنظام، والإيمان المشترك.",
          },
        },
        careers: {
          apply: {
            title: "قدّم طلبك",
            subtitle: "قدّم طلب التوظيف لهذا المنصب. نحن نُقدّر وقتك ونراجع جميع الطلبات بعناية.",
            loading: "جاري التحميل…",
            role_overview: "نظرة عامة على الوظيفة",
            requirements: "المتطلبات",
            application: "طلب التوظيف",
            closes: "يغلق في",
            form: {
              name: "الاسم",
              name_ph: "اكتب اسمك الكامل",
              email: "البريد الإلكتروني",
              email_ph: "you@example.com",
              phone: "رقم الهاتف",
              phone_ph: "+218…",
              cover: "خطاب التقديم",
              cover_ph: "حدثنا عن سبب كونك المرشح المناسب…",
              cover_hint: "اختياري ولكن يُنصح بكتابته.",
              cv: "السيرة الذاتية (PDF/DOC)",
              cv_hint: "الملفات المقبولة: PDF, DOC, DOCX"
            },
            submit: "إرسال الطلب",
            submit_loading: "جاري الإرسال…",
            privacy: "نحفظ بيانات طلبك بأمان ولا نستخدمها إلا لغرض تقييم ترشحك.",
            toast: {
              ok_title: "تم إرسال الطلب",
              ok_desc: "شكرًا لك! سنتواصل معك قريبًا.",
              error_title: "فشل في إرسال الطلب"
            },
            errors: {
              missing_id: "معرّف الوظيفة مفقود",
              not_found: "الوظيفة غير موجودة",
              load_failed: "فشل تحميل تفاصيل الوظيفة",
              required: "يرجى ملء جميع الحقول المطلوبة وإرفاق سيرتك الذاتية.",
              submit_failed: "فشل إرسال الطلب."
            }
          }
        },
        about: {
          title: "من مكتب واحد إلى حركة عالمية",
          body: "في عام 2020، بدأ متداول واحد بمشاركة ملاحظاته ومراجعاته اليومية—فأصبح التعليم وسيلة لصقل المهارة وكشف هدف أعمق. في عام 2021، تكوّن فريق صغير من المطورين والمحللين والموجهين، ليستبدل العشوائية بالنظام. في عام 2022، وُلد أول منهج تدريبي منظم يجمع بين الدقة التقنية وإيقاع الأسواق الحقيقية. في عام 2023، أثبتت النتائج فعالية النظام حيث تحدثت البيانات والاتساق بأعلى صوت. في عام 2024، أطلقنا منظومة متكاملة تجمع التعليم والتحليل والإرشاد تحت سقف واحد. واليوم، في عام 2025، ما بدأ كمكتب واحد أصبح شبكة عالمية—حركة تساعد المتداولين على تحقيق الحرية من خلال الهيكل والانضباط والالتزام.",
          more: {
            title: "…والقصة مستمرة",
            subtitle: "كل عام يجلب أدوات جديدة، وتوجيهاً أعمق، ومجتمعاً متنامياً من المتداولين المنضبطين الذين يحققون نتائج حقيقية."
          },
          cta: {
            title: "انضم إلى الفصل التالي",
            subtitle: "تعلّم وتداول وتطوّر من خلال نظام بُني على الخبرة والانضباط—بمسؤولية وثبات وبتعاون حقيقي."
          }
        },
      },
    },
  },

    fr: {
    translation: {
      common: {
        view: "Voir",
        explore: "Explorer",
        downloads: "Téléchargements",
        read_more: "En savoir plus",
        enroll_now: "S’inscrire",
        free: "Gratuit",
        anonymous: "Étudiant",
      },
      errors: {
        404: {
          title: "Page introuvable",
          subtitle: "La page que vous cherchez n’est pas disponible, ou nos serveurs ont eu un léger incident.",
          code: "Erreur",
          trace: "ID de trace",
          cta_home: "Aller à l’accueil",
          cta_retry: "Réessayer",
          cta_support: "Contacter le support",
          helper: "Si cela persiste, indiquez le code d’erreur ou l’ID de trace lors de votre contact avec le support."
        }
      },
      company: {
        careers: {
          apply: "Postuler",
        },
        about: {
          title: "D’un simple bureau à un mouvement",
          body: "En 2020, un seul trader commence à partager ses notes et analyses de marché—enseigner affine sa discipline et révèle une mission plus grande. En 2021, une petite équipe de développeurs, d’analystes et de mentors se forme, remplaçant l’improvisation par des systèmes. En 2022, naît le premier programme structuré, alliant précision technique et rythme réel des marchés. En 2023, les résultats parlent d’eux-mêmes : cohérence, données, crédibilité. En 2024, notre propre écosystème réunit éducation, analyses et mentorat sous un même toit. Aujourd’hui, en 2025, ce qui n’était qu’un bureau est devenu un réseau mondial—un mouvement qui aide les traders à atteindre la liberté grâce à la structure, la discipline et la conviction.",
          more: {
            title: "…et l’histoire continue",
            subtitle: "Chaque année apporte de nouveaux outils, un mentorat renforcé et une communauté croissante de traders disciplinés aux résultats concrets."
          },
          cta: {
            title: "Rejoignez le prochain chapitre",
            subtitle: "Apprenez, tradez et progressez avec un système conçu par des traders expérimentés—de manière responsable, cohérente et collective."
          }
        },
        timeline: {
          "2020": {
            title: "Du trader au mentor",
            desc:
              "Ce qui n’était qu’une routine solitaire devient des notes partagées et des revues en direct. Enseigner affine la pratique et révèle une mission plus vaste.",
          },
          "2021": {
            title: "Une équipe prend forme",
            desc:
              "Développeurs, analystes et formateurs rejoignent l’aventure. Les systèmes remplacent l’improvisation. L’entreprise prend ses fondations.",
          },
          "2022": {
            title: "Le premier plan directeur",
            desc:
              "Chaque processus est documenté, chaque stratégie structurée. Le premier programme unit rigueur technique et réalisme du terrain.",
          },
          "2023": {
            title: "La preuve par les résultats",
            desc:
              "Les traders formés au sein du système démontrent une constance mesurable. Les données remplacent les récits, et la marque gagne en crédibilité.",
          },
          "2024": {
            title: "Construire l’écosystème",
            desc:
              "Lancement d’une plateforme intégrée : analyse, formation et mentorat réunis. Objectif : croissance durable et transparence totale.",
          },
          "2025": {
            title: "Un mouvement avant tout",
            desc:
              "D’un bureau isolé à un réseau mondial. Une entreprise qui enseigne la liberté financière par la méthode, la discipline et la vision partagée.",
          },
        },
        apply: {
          title: "Postuler",
          subtitle: "Soumettez votre candidature pour ce poste. Nous respectons votre temps et examinons attentivement chaque demande.",
          loading: "Chargement…",
          role_overview: "Aperçu du poste",
          requirements: "Exigences",
          application: "Candidature",
          closes: "Clôture",
          form: {
            name: "Nom",
            name_ph: "Votre nom complet",
            email: "E-mail",
            email_ph: "vous@example.com",
            phone: "Téléphone",
            phone_ph: "+33…",
            cover: "Lettre de motivation",
            cover_ph: "Expliquez pourquoi vous êtes un bon candidat…",
            cover_hint: "Facultatif mais recommandé.",
            cv: "CV (PDF/DOC)",
            cv_hint: "Formats acceptés : PDF, DOC, DOCX"
          },
          submit: "Soumettre la candidature",
          submit_loading: "Envoi en cours…",
          privacy: "Nous stockons votre candidature en toute sécurité et ne l'utilisons que pour évaluer votre profil.",
          toast: {
            ok_title: "Candidature soumise",
            ok_desc: "Merci ! Nous vous contacterons bientôt.",
            error_title: "Échec de l’envoi"
          },
          errors: {
            missing_id: "Identifiant du poste manquant",
            not_found: "Poste introuvable",
            load_failed: "Impossible de charger le poste",
            required: "Veuillez remplir tous les champs obligatoires et joindre votre CV.",
            submit_failed: "Échec de la soumission de la candidature."
          }
        },
      },
      learn: {
        resources: {
          title: "Ressources d’apprentissage",
          subtitle:
            "Guides premium, listes de vérification et vidéos détaillées pour accélérer vos progrès.",
          guides: "Guides pas à pas",
          guides_desc:
            "Playbooks structurés, des bases aux stratégies avancées.",
          videos: "Bibliothèque vidéo",
          videos_desc:
            "Leçons concises et analyses avec des exemples réels.",
          downloads: "Téléchargements",
          downloads_desc: "Checklists, modèles et outils prêts à l’emploi.",
          research: "Notes de recherche",
          research_desc: "Notes et cadres utilisés par nos mentors.",
          pitch:
            "Accédez au même cursus que nos mentors avec des cas réels et des cadres actionnables. Commencez gratuitement, améliorez quand vous voulez.",
          guarantee: "Validé par les mentors",
          guarantee_value: "Concret & actionnable",
          time_to_complete: "Durée moyenne",
          time_value: "2–6 semaines",
          image_alt: "Des étudiants apprennent avec un contenu structuré",
          point1:
            "Pratique, pas théorique : exemples réels et étapes guidées.",
          point2: "Accès cohorte & sessions Q/R hebdomadaires.",
          point3: "Mises à jour à vie des supports.",
          point4: "Certificat de réussite pour valoriser vos compétences.",
          syllabus: "Programme du cours (aperçu)",
          module1: "Fondamentaux & état d’esprit",
          module2: "Stratégies clés & risque",
          module3: "Outils, modèles & automatisation",
          module4: "Études de cas & revues en direct",
          testimonials_title: "Plébiscité par les apprenants",
          testimonial1:
            "Du contenu en or. Je suis passé de l’intuition à un plan clair.",
          testimonial2:
            "Clair, concis et pratique. Les modèles m’ont fait gagner des semaines.",
          testimonial3:
            "Je comprends enfin le pourquoi derrière les décisions.",
          role1: "Entrepreneur",
          role2: "Analyste",
          role3: "Étudiant",
          cta_banner:
            "Prêt à aller plus loin ? Rejoignez le cours complet et débloquez toutes les ressources.",
        },
        faq: {
          title: "Foire aux questions",
          subtitle: "Tout ce qu’il faut savoir avant de vous inscrire.",
          q1: "Combien de temps dure l’accès ?",
          a1: "Accès à vie au contenu et à ses futures mises à jour.",
          q2: "Est-ce que je reçois un certificat ?",
          a2: "Oui, un certificat téléchargeable après la réussite du cours.",
          q3: "Un support est-il disponible ?",
          a3: "Support 24/7 via chat et e-mail prioritaire.",
        },
      },
      legal: {
        refund: {
          title: "Politique de remboursement",
          p1: "Si vous n’êtes pas satisfait dans les 7 jours suivant l’achat, contactez le support pour un remboursement total (conditions applicables).",
          p2: "Les remboursements excluent l’usage abusif du contenu, le partage ou la violation des politiques.",
          p3: "Pour initier un remboursement, envoyez un e-mail au support avec votre numéro de commande et la raison.",
          eligibility: "Éligibilité : premier achat d’un produit/niveau donné, avec une utilisation raisonnable dans les limites du fair use.",
          exclusions: "Exclusions : copie/partage du contenu, téléchargement d’une grande partie des supports, partage de compte ou abus de politique.",
          digital: "Étant donné que l’accès est numérique, les remboursements peuvent être partiels ou refusés si une grande partie du contenu a été consommée.",
          method: "Les remboursements sont effectués en USDT sur le même réseau utilisé pour le paiement. Les frais de réseau ne sont pas remboursables.",
          timeline: "Délai de traitement : jusqu’à 10 jours ouvrables après approbation, hors délais de réseau.",
          process: "Pour demander un remboursement, envoyez un e-mail au support avec votre identifiant de commande, votre adresse de portefeuille et le motif."
        },
        terms: {
          title: "Conditions générales",
          last_updated: "8 octobre 2025",
          intro:
            "En utilisant cette plateforme, en vous inscrivant à nos cours ou en achetant du contenu numérique, vous acceptez ces conditions générales. Veuillez les lire attentivement avant de continuer.",
          scope: {
            title: "Portée",
            p1: "Ces conditions régissent votre utilisation de nos services éducatifs, cours, abonnements et accès à la communauté, axés sur l’éducation au trading forex et crypto.",
            p2: "Tout le contenu fourni est à des fins éducatives et ne constitue pas un conseil financier ou d’investissement."
          },
          use: {
            title: "Utilisation du contenu & propriété intellectuelle",
            p1: "Vous bénéficiez d’une licence personnelle, non transférable et limitée pour accéder à nos supports éducatifs et les utiliser. Il est interdit de partager, revendre, distribuer ou diffuser publiquement notre contenu sans autorisation écrite.",
            p2: "Toutes les vidéos, PDF et modèles des cours sont protégés par le droit d’auteur. Une utilisation non autorisée peut entraîner la résiliation du compte et des poursuites."
          },
          conduct: {
            title: "Comportement de l’utilisateur",
            p1: "Vous vous engagez à ne pas abuser de la plateforme, à ne pas frauder, à ne pas partager votre compte et à ne pas tenter d’accéder sans autorisation à nos systèmes.",
            p2: "Nous nous réservons le droit de suspendre ou de résilier les comptes impliqués dans le piratage de contenu, un comportement abusif ou toute activité compromettant l’intégrité de la plateforme."
          },
          payments: {
            title: "Paiements & remboursements",
            p1: "Tous les paiements sont traités exclusivement en USDT. Veuillez consulter notre Politique de remboursement pour les conditions d’éligibilité et les délais de traitement.",
            p2: "Vous êtes responsable de vérifier les adresses de paiement et le réseau sélectionné avant d’envoyer des transactions crypto."
          },
          disclaimer: {
            title: "Avertissement sur les risques & finalité éducative",
            p1: "Le trading du forex, des cryptomonnaies et des marchés financiers comporte des risques importants. Les performances passées ne préjugent pas des résultats futurs.",
            p2: "Nos cours, modèles et exemples sont purement éducatifs et ne constituent pas un conseil financier, une recommandation de trading ou une orientation d’investissement.",
            p3: "Vous reconnaissez être seul responsable de toute décision de trading prise sur la base de nos supports."
          },
          liability: {
            title: "Limitation de responsabilité",
            p1: "Nous déclinons toute responsabilité pour les pertes, dommages ou réclamations résultant de votre utilisation de la plateforme ou de l’application de nos contenus éducatifs.",
            p2: "Toutes les informations sont fournies « en l’état » sans garantie d’exactitude, d’exhaustivité ou d’adéquation à un usage particulier."
          },
          modifications: {
            title: "Modifications des conditions",
            p1: "Nous pouvons mettre à jour ces conditions périodiquement pour refléter de nouvelles fonctionnalités, la législation ou nos pratiques. La poursuite de l’utilisation après mise à jour vaut acceptation."
          }
        },
        payments: {
          usdt_only: "Nous n’acceptons que l’USDT pour l’instant afin de proposer la crypto la plus rapide et la plus fiable pour les paiements et d’impliquer nos étudiants tôt dans l’écosystème crypto. Merci de votre patience pendant que nous élargissons nos moyens de paiement.",
          nb: "NB : Nous n’acceptons que TRC20 afin de minimiser les frais pour nos étudiants et nous exigeons un hash de transaction (tx hash) à la fin du paiement pour vérifier chaque transaction. Merci de votre coopération."
        },
        privacy_refund: {
          title: "Politique de confidentialité et de remboursement",
          last_updated: "8 octobre 2025",
          intro: "Cette politique explique comment nous gérons vos données et comment fonctionnent les remboursements pour nos produits éducatifs et abonnements liés au trading forex et crypto.",
          scope: {
            title: "Portée",
            p1: "Ces conditions s’appliquent à tous les cours, sessions en direct, modèles et niveaux d’adhésion disponibles sur notre plateforme.",
            p2: "Les marchés financiers sont risqués. Nous fournissons uniquement de la formation — pas de conseil en investissement, ni de signaux, ni de gestion de portefeuille."
          },
          payments: {
            title: "Paiements et tarifs (USDT uniquement)",
            p1: "Toutes les ventes sont traitées exclusivement en USDT. Lorsque c’est possible, nous acceptons l’USDT uniquement sur le réseau TRC20.",
            li1: "Les prix peuvent être affichés dans votre devise locale à titre indicatif, mais le règlement se fait en USDT.",
            li2: "Les frais de réseau et les délais de confirmation ne dépendent pas de nous.",
            li3: "Vous êtes responsable de l’envoi du montant exact à la bonne adresse sur la bonne chaîne. Des fonds mal envoyés peuvent être irrécupérables.",
            note: "Remarque",
            note_text: "Les paiements sont confirmés après un nombre suffisant de validations on-chain."
          },
          access: {
            title: "Accès, renouvellements et annulations",
            li1: "L’accès au contenu numérique est personnel et non transférable.",
            li2: "Les abonnements se renouvellent automatiquement sauf annulation avant la prochaine date de facturation.",
            li3: "L’annulation arrête les paiements futurs ; elle ne rembourse pas rétroactivement les périodes antérieures."
          },
          chargebacks: {
            title: "Rétrofacturations et litiges",
            p1: "Veuillez nous contacter d’abord pour résoudre les problèmes de facturation ou d’accès. Les litiges non autorisés peuvent entraîner la suspension du compte."
          }
        },
        privacy: {
          data: {
            title: "Confidentialité : données collectées",
            account: "Données de compte : nom, e-mail et identifiants de connexion.",
            billing: "Métadonnées de facturation : ID de transaction, adresse de portefeuille et détails du plan (aucune clé privée collectée).",
            usage: "Analyses d’utilisation : pages vues, progression, informations sur l’appareil et localisation approximative (prévention de la fraude et amélioration du produit)."
          },
          use: {
            title: "Comment nous utilisons vos données",
            provide: "Fournir et améliorer le contenu des cours, suivre la progression et offrir du support.",
            security: "Se protéger contre la fraude, les abus et le partage non autorisé.",
            comms: "Envoyer les e-mails de service essentiels. Vous pouvez vous désinscrire des messages marketing non essentiels."
          },
          cookies: {
            title: "Cookies, analyses et services tiers",
            p1: "Nous utilisons des cookies et technologies similaires pour l’authentification, les préférences et l’analyse. Certains prestataires tiers peuvent traiter des données personnelles limitées selon leurs propres politiques."
          },
          security: {
            title: "Conservation et sécurité des données",
            retention: "Nous conservons les données uniquement aussi longtemps que nécessaire pour les finalités décrites ou tel qu’exigé par la loi.",
            measures: "Nous appliquons des mesures techniques et organisationnelles, mais aucune méthode n’est 100 % sûre."
          },
          rights: {
            title: "Vos droits",
            p1: "Sous réserve des lois applicables, vous pouvez demander l’accès, la rectification, la suppression ou la portabilité de vos données. Une vérification peut être requise."
          }
        },
        common: {
          last_updated: "Dernière mise à jour",
          contact: "Contact",
          contact_text: "Pour toute question relative à la confidentialité ou aux remboursements, contactez-nous à ",
          support_email: "support@ldnprime.com",
          disclaimer: "Rien ici ne constitue un conseil financier. Le trading comporte un risque significatif de perte. Le contenu éducatif est fourni tel quel, sans garantie."
        }
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources, // your existing bundles (can be {}), ns defaults to "translation"
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: { order: ["querystring", "localStorage", "navigator"] },
  })
  .then(() => {
    // 👇 pass the *namespace contents* (the "translation" object), not the wrapper
    i18n.addResourceBundle("en", "translation", NEW_PAGE_STRINGS.en.translation, true, true);
    i18n.addResourceBundle("ar", "translation", NEW_PAGE_STRINGS.ar.translation, true, true);
    i18n.addResourceBundle("fr", "translation", NEW_PAGE_STRINGS.fr.translation, true, true);

    // optional: if your UI rendered before bundles were added, force a refresh
    i18n.reloadResources();
    i18n.emit("loaded"); // helps some setups re-render
  });

export default i18n;

