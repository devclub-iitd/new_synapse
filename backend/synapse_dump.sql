--
-- PostgreSQL database dump
--

\restrict Gjzwyg7OJ9DvFYbVRbfGzzpEhU2AOPUeJ0IHD1tGJNPHKjvo7iZ1psNdo33UThh

-- Dumped from database version 17.8 (a48d9ca)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_event_id_fkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS fk_events_org_id;
ALTER TABLE IF EXISTS ONLY public.calendar_shares DROP CONSTRAINT IF EXISTS calendar_shares_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_org_id_fkey;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_entry_number;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_roles_user_id;
DROP INDEX IF EXISTS public.ix_roles_org_id;
DROP INDEX IF EXISTS public.ix_registrations_id;
DROP INDEX IF EXISTS public.ix_events_org_id;
DROP INDEX IF EXISTS public.ix_events_name;
DROP INDEX IF EXISTS public.ix_events_id;
DROP INDEX IF EXISTS public.ix_calendar_shares_share_token;
DROP INDEX IF EXISTS public.ix_calendar_shares_id;
DROP INDEX IF EXISTS public.ix_api_keys_org_id;
DROP INDEX IF EXISTS public.ix_api_keys_key_hash;
DROP INDEX IF EXISTS public.ix_api_keys_is_active;
DROP INDEX IF EXISTS public.ix_api_keys_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_user_id_org_id_role_name_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_name_key;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_shares DROP CONSTRAINT IF EXISTS calendar_shares_pkey;
ALTER TABLE IF EXISTS ONLY public.api_keys DROP CONSTRAINT IF EXISTS api_keys_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS _user_event_uc;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.registrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organizations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.calendar_shares ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.api_keys ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.registrations_id_seq;
DROP TABLE IF EXISTS public.registrations;
DROP SEQUENCE IF EXISTS public.organizations_id_seq;
DROP TABLE IF EXISTS public.organizations;
DROP SEQUENCE IF EXISTS public.events_id_seq;
DROP TABLE IF EXISTS public.events;
DROP SEQUENCE IF EXISTS public.calendar_shares_id_seq;
DROP TABLE IF EXISTS public.calendar_shares;
DROP SEQUENCE IF EXISTS public.api_keys_id_seq;
DROP TABLE IF EXISTS public.api_keys;
DROP TYPE IF EXISTS public.role_name_enum;
DROP TYPE IF EXISTS public.org_type_enum;
DROP TYPE IF EXISTS public.org_name_enum;
--
-- Name: org_name_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.org_name_enum AS ENUM (
    'student affairs council',
    'board for student welfare',
    'board for sports activities',
    'board for recreational and creative activities',
    'board for student publications',
    'co-curricular and academic interaction council',
    'devclub',
    'robotics club',
    'aeromodelling club',
    'business and consulting club',
    'economics club',
    'physics and astronomy club',
    'algorithms and computing club',
    'aries',
    'igem',
    'hyperloop club',
    'mathsoc',
    'aces acm',
    'chemical engineering society',
    'mechanical engineering society',
    'electrical engineering society',
    'civil engineering forum',
    'materials science and engineering society',
    'biotechnology society',
    'physics society',
    'textile engineering society',
    'energy society',
    'music club',
    'dance club',
    'dramatics club',
    'literary club',
    'debating club',
    'photography and films club',
    'fine arts and crafts club',
    'design club',
    'quizzing club',
    'hindi samiti',
    'spic macay',
    'indradhanu',
    'rendezvous',
    'tryst',
    'becon',
    'literati',
    'cse',
    'ee',
    'me',
    'ce',
    'che',
    'dbeb',
    'physics',
    'chemistry',
    'maths',
    'textile'
);


--
-- Name: org_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.org_type_enum AS ENUM (
    'club',
    'board',
    'society',
    'fest',
    'department'
);


--
-- Name: role_name_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role_name_enum AS ENUM (
    'overall coordinator',
    'coordinator',
    'executive',
    'general secretary',
    'deputy general secretary',
    'secretary',
    'convener',
    'president',
    'vice president',
    'team head',
    'achead'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    org_id integer NOT NULL,
    key_hash character varying NOT NULL,
    key_prefix character varying(8) NOT NULL,
    label character varying NOT NULL,
    is_active boolean,
    allowed_ips json,
    created_at timestamp without time zone,
    last_used_at timestamp without time zone
);


--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: calendar_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_shares (
    id integer NOT NULL,
    user_id integer NOT NULL,
    share_token character varying NOT NULL,
    is_active boolean,
    created_at timestamp without time zone
);


--
-- Name: calendar_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calendar_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calendar_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calendar_shares_id_seq OWNED BY public.calendar_shares.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    date timestamp without time zone NOT NULL,
    venue character varying NOT NULL,
    image_url character varying,
    event_manager_email character varying NOT NULL,
    tags json,
    target_audience json,
    is_private boolean,
    custom_form_schema json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    registration_deadline timestamp without time zone,
    org_id integer NOT NULL,
    duration_hours double precision
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying NOT NULL,
    org_type character varying NOT NULL,
    banner_url character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    custom_answers json,
    feedback_rating integer,
    registered_at timestamp without time zone
);


--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    org_id integer NOT NULL,
    role_name character varying NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    entry_number character varying,
    email character varying NOT NULL,
    name character varying NOT NULL,
    department character varying,
    hostel character varying,
    current_year integer,
    photo_url character varying,
    interests json,
    is_active boolean,
    is_superuser boolean,
    created_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: calendar_shares id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_shares ALTER COLUMN id SET DEFAULT nextval('public.calendar_shares_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, org_id, key_hash, key_prefix, label, is_active, allowed_ips, created_at, last_used_at) FROM stdin;
2	86	c78ecde96739e06de504ef4b092149353fbba2a4b0f3da4bf457c4af57d19f95	syn_Zs1X	default	f	[]	2026-04-09 06:53:43.828576	\N
1	86	0866740187887091ef4afe93ecbdd36f0737201cdcf6f54224c3c0ed8fc81e7a	syn_a_uU	caic-production	f	[]	2026-04-08 20:36:24.531504	2026-04-09 06:36:54.357372
3	144	d8d4db5394c76ce9c605b54c6c882467c6bc41c80e963168cd99daf53e4a2377	syn_aZPm	default	t	[]	2026-04-09 06:54:59.906562	2026-04-09 06:57:24.601803
4	101	c6214996b503d6ed9fff3f2f727e33c067905dcb1336537203b258e70f74e1a4	syn_3iar	default	t	[]	2026-04-09 06:57:51.330817	\N
5	86	0866c2b49ad825c4f5e3b83d1869f71c9b2ed2da850926dbe1b6271951a1da45	syn_qoWu	default	f	[]	2026-04-09 07:10:04.492378	2026-04-09 07:10:35.719272
6	86	f10414786913445f49cd447349d73c006ae4001b899f90d697b1c94bb2bcb403	syn_JxZx	default	t	[]	2026-04-09 07:10:49.229893	\N
7	85	40d581576cd1e6372fc756e3afb8c653a1322953bea70716725b4b07c014a48f	syn_XGCT	default	t	[]	2026-04-09 07:11:10.321998	\N
\.


--
-- Data for Name: calendar_shares; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_shares (id, user_id, share_token, is_active, created_at) FROM stdin;
1	6	d9a78cec-3055-45e5-a2ae-f728033761d3	f	2026-03-06 18:25:20.52138
2	6	8bdd4dfa-1ea8-491b-bec3-44c1a6c87e46	t	2026-03-06 18:25:42.767763
3	7	f3cd0f5b-c894-4b4c-afea-888f6fcee82f	t	2026-03-07 08:19:23.658778
4	8	6d4f3186-9d35-4d4f-a291-5689a37e711e	t	2026-03-07 13:30:02.942362
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, name, description, date, venue, image_url, event_manager_email, tags, target_audience, is_private, custom_form_schema, created_at, updated_at, registration_deadline, org_id, duration_hours) FROM stdin;
40	past event	it shd disappear	2026-03-06 12:49:00	lh121	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772794470/org_banners/devclub.jpg	mt1240916@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 12:41:26.419197	2026-03-06 12:43:12.801815	\N	87	\N
44	Whyyyy	Nope	2026-03-11 17:43:00	Why	\N	ph1240553@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-10 17:43:53.041983	2026-03-10 17:43:53.041988	\N	89	\N
47	r3rf	nnn	2026-04-17 13:08:00	lh	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772776653/org_banners/devclub.jpg	ph1240553@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-04-08 13:08:16.267602	2026-04-08 13:08:16.267608	\N	87	\N
46	sdj	vsv	2026-04-23 15:31:00	lh205	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772776653/org_banners/devclub.jpg	ph1240553@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": [3]}	t	[]	2026-04-02 16:28:45.361424	2026-04-02 16:28:45.361428	2026-04-04 16:28:00	87	\N
42	test 3	why do u wanna join it?	2026-03-28 08:05:00	no	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772776653/org_banners/devclub.jpg	ph1240553@iitd.ac.in	[]	{"depts": ["Computer Science and Engineering", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-07 08:09:03.427265	2026-03-07 12:13:06.980091	2026-03-10 08:06:00	87	\N
43	nope	what?	2026-03-12 10:15:00	lh22	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772776653/org_banners/devclub.jpg	ph1240553@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-07 08:17:17.80937	2026-03-07 08:17:17.809375	2026-03-11 10:15:00	87	\N
41	check time	check time	2026-03-07 13:30:00	lh108	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772794470/org_banners/devclub.jpg	mt1240916@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 13:12:28.658088	2026-03-06 13:26:37.796014	\N	87	\N
38	check feedback	.	2026-03-06 13:30:00	108	\N	cs1240020@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 11:57:22.405016	2026-03-06 13:06:04.506236	2026-03-06 13:20:00	87	\N
39	feedback 2	.	2026-03-06 12:41:00	111	\N	cs1240020@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 11:58:34.085491	2026-03-06 12:35:41.764092	2026-03-06 12:38:00	87	\N
31	cs	.	2026-03-07 05:48:00	108	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772791321/events/280e0b5a-efc2-46a0-8dd7-53790ac8c717.png	cs1240020@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 05:48:21.083565	2026-03-06 05:48:21.083565	\N	87	\N
32	noncs	edited	2026-03-07 12:30:00	108	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772791321/events/280e0b5a-efc2-46a0-8dd7-53790ac8c717.png	cs1240020@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 05:49:00.019287	2026-03-06 13:11:33.156913	\N	87	\N
33	test	nope	2026-03-20 13:48:00	lhc	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772791206/events/e6e3f5f0-4e03-4d77-a6ba-f85a73d52a2d.png	ph1240553@iitd.ac.in	[]	{"depts": ["Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nilgiri", "Satpura", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": [2]}	f	[]	2026-03-06 06:19:20.441438	2026-03-06 10:01:12.394918	\N	87	\N
35	trying registration	.	2026-03-07 10:10:00	108	\N	cs1240020@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-06 10:11:09.322425	2026-03-06 10:11:09.322425	2026-03-06 16:10:00	87	\N
45	Naaaaa	H	2026-03-14 17:44:00	Hhh	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772872051/org_banners/economics_club.jpg	ph1240553@iitd.ac.in	[]	{"depts": ["Applied Mechanics", "Biochemical Engineering and Biotechnology", "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science and Engineering", "Design", "Electrical Engineering", "Energy Science and Engineering", "Humanities and Social Sciences", "Management Studies", "Materials Science and Engineering", "Mathematics", "Mechanical Engineering", "Physics", "Textile and Fibre Engineering"], "hostels": ["Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"], "years": []}	f	[]	2026-03-10 17:44:57.52762	2026-03-10 17:44:57.527625	2026-03-13 17:47:00	91	\N
49	jhhfk	noo way 	2026-04-15 05:46:00	jlll	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1775691426/events/41c6a3d6-ae0c-4c46-ba63-0f1dd80e0608.jpg		["robotick"]	{"depts": ["Biochemical Engineering and Biotechnology", "Chemical Engineering", "Physics", "Mathematics"], "hostels": ["Girnar", "Himadri"], "years": [3, 2]}	f	[]	2026-04-08 23:28:27.716166	2026-04-09 07:10:36.432284	\N	86	\N
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, org_type, banner_url, created_at) FROM stdin;
80	student affairs council	board	\N	2026-04-08 14:13:08.740011+00
81	board for hostel management	board	\N	2026-04-08 14:13:08.740011+00
82	board for student welfare	board	\N	2026-04-08 14:13:08.740011+00
83	board for sports activities	board	\N	2026-04-08 14:13:08.740011+00
84	board for recreational and creative activities	board	\N	2026-04-08 14:13:08.740011+00
85	board for student publications	board	\N	2026-04-08 14:13:08.740011+00
88	robotics club	club	\N	2026-04-08 14:13:08.740011+00
89	aeromodelling club	club	\N	2026-04-08 14:13:08.740011+00
90	business and consulting club	club	\N	2026-04-08 14:13:08.740011+00
92	physics and astronomy club	club	\N	2026-04-08 14:13:08.740011+00
93	algorithms and computing club	club	\N	2026-04-08 14:13:08.740011+00
94	aries	club	\N	2026-04-08 14:13:08.740011+00
95	igem	club	\N	2026-04-08 14:13:08.740011+00
96	hyperloop club	club	\N	2026-04-08 14:13:08.740011+00
97	indian game theory society	club	\N	2026-04-08 14:13:08.740011+00
98	blockchain society	society	\N	2026-04-08 14:13:08.740011+00
99	axlr8r formula racing	club	\N	2026-04-08 14:13:08.740011+00
100	mathsoc	society	\N	2026-04-08 14:13:08.740011+00
101	aces acm	society	\N	2026-04-08 14:13:08.740011+00
102	beta	society	\N	2026-04-08 14:13:08.740011+00
103	mses	society	\N	2026-04-08 14:13:08.740011+00
104	cef	society	\N	2026-04-08 14:13:08.740011+00
105	mes	society	\N	2026-04-08 14:13:08.740011+00
106	ches	society	\N	2026-04-08 14:13:08.740011+00
107	energy society	society	\N	2026-04-08 14:13:08.740011+00
108	physoc	society	\N	2026-04-08 14:13:08.740011+00
109	ees	society	\N	2026-04-08 14:13:08.740011+00
110	tes	society	\N	2026-04-08 14:13:08.740011+00
111	chemocronies	society	\N	2026-04-08 14:13:08.740011+00
112	music club	club	\N	2026-04-08 14:13:08.740011+00
113	dance club	club	\N	2026-04-08 14:13:08.740011+00
114	dramatics club	club	\N	2026-04-08 14:13:08.740011+00
115	literary club	club	\N	2026-04-08 14:13:08.740011+00
116	debating club	club	\N	2026-04-08 14:13:08.740011+00
117	photography and films club	club	\N	2026-04-08 14:13:08.740011+00
118	fine arts and crafts club	club	\N	2026-04-08 14:13:08.740011+00
119	design club	club	\N	2026-04-08 14:13:08.740011+00
120	quizzing club	club	\N	2026-04-08 14:13:08.740011+00
121	hindi samiti	club	\N	2026-04-08 14:13:08.740011+00
122	spic macay	club	\N	2026-04-08 14:13:08.740011+00
123	envogue	club	\N	2026-04-08 14:13:08.740011+00
124	indradhanu	club	\N	2026-04-08 14:13:08.740011+00
125	rendezvous	fest	\N	2026-04-08 14:13:08.740011+00
126	tryst	fest	\N	2026-04-08 14:13:08.740011+00
127	becon	fest	\N	2026-04-08 14:13:08.740011+00
128	literati	fest	\N	2026-04-08 14:13:08.740011+00
129	sportech	fest	\N	2026-04-08 14:13:08.740011+00
130	aquatics	sport	\N	2026-04-08 14:13:08.740011+00
131	athletics	sport	\N	2026-04-08 14:13:08.740011+00
132	badminton	sport	\N	2026-04-08 14:13:08.740011+00
133	basketball	sport	\N	2026-04-08 14:13:08.740011+00
134	chess	sport	\N	2026-04-08 14:13:08.740011+00
135	cricket	sport	\N	2026-04-08 14:13:08.740011+00
136	football	sport	\N	2026-04-08 14:13:08.740011+00
137	hockey	sport	\N	2026-04-08 14:13:08.740011+00
138	lawn tennis	sport	\N	2026-04-08 14:13:08.740011+00
139	squash	sport	\N	2026-04-08 14:13:08.740011+00
140	table tennis	sport	\N	2026-04-08 14:13:08.740011+00
141	volleyball	sport	\N	2026-04-08 14:13:08.740011+00
142	weightlifting	sport	\N	2026-04-08 14:13:08.740011+00
143	applied mechanics	department	\N	2026-04-08 14:13:08.740011+00
144	biochemical engineering and biotechnology	department	\N	2026-04-08 14:13:08.740011+00
145	chemical engineering	department	\N	2026-04-08 14:13:08.740011+00
146	chemistry	department	\N	2026-04-08 14:13:08.740011+00
147	civil engineering	department	\N	2026-04-08 14:13:08.740011+00
148	computer science and engineering	department	\N	2026-04-08 14:13:08.740011+00
149	design	department	\N	2026-04-08 14:13:08.740011+00
150	electrical engineering	department	\N	2026-04-08 14:13:08.740011+00
151	energy science and engineering	department	\N	2026-04-08 14:13:08.740011+00
152	humanities and social sciences	department	\N	2026-04-08 14:13:08.740011+00
153	management studies	department	\N	2026-04-08 14:13:08.740011+00
154	materials science and engineering	department	\N	2026-04-08 14:13:08.740011+00
155	mathematics	department	\N	2026-04-08 14:13:08.740011+00
156	mechanical engineering	department	\N	2026-04-08 14:13:08.740011+00
157	physics	department	\N	2026-04-08 14:13:08.740011+00
158	textile and fibre engineering	department	\N	2026-04-08 14:13:08.740011+00
87	devclub	club	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772794470/org_banners/devclub.jpg	2026-04-08 14:13:08.740011+00
91	economics club	club	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772872051/org_banners/economics_club.jpg	2026-04-08 14:13:08.740011+00
86	co-curricular and academic interaction council	board	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1775658948/org_banners/co-curricular_and_academic_interaction_council.jpg	2026-04-08 14:13:08.740011+00
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, user_id, event_id, custom_answers, feedback_rating, registered_at) FROM stdin;
16	6	31	{}	\N	2026-03-06 10:17:34.644473
19	6	38	{}	5	2026-03-06 13:14:38.123158
14	8	32	{"food pref": "veg", "t shirt": "m"}	3	2026-03-06 10:02:36.343142
22	7	43	{}	\N	2026-03-10 17:39:12.357555
21	7	32	{}	3	2026-03-07 08:11:14.760912
23	6	33	{}	\N	2026-03-18 13:58:06.564465
13	7	33	{}	3	2026-03-06 07:11:35.200247
25	7	47	{}	\N	2026-04-08 14:41:41.257631
27	7	49	{}	\N	2026-04-08 23:41:45.302154
28	6	49	{}	\N	2026-04-08 23:46:25.786615
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, user_id, org_id, role_name) FROM stdin;
1	7	86	vice president
2	7	89	general secretary
3	6	125	secretary
4	8	87	overall coordinator
5	7	87	vice president
6	6	87	overall coordinator
7	7	91	president
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, entry_number, email, name, department, hostel, current_year, photo_url, interests, is_active, is_superuser, created_at) FROM stdin;
8	MT1240916	mt1240916@iitd.ac.in	Swati Nim	Mathematics	Himadri	2	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772891975/profiles/4eb50777-3494-48ed-ac87-380b90ef164a.png	["AI", "Web Development", "Competitive Programming"]	t	t	2026-03-06 09:48:41.44258
6	CS1240020	cs1240020@iitd.ac.in	Rakshit Modi	Computer Science and Engineering	Nalanda	2	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772792232/profiles/727d7dbc-a6d6-4460-9854-7266b787e2ee.png	["Web Development", "Machine Learning", "Competitive Programming", "Blockchain", "AI"]	t	t	2026-03-06 05:32:18.717364
7	PH1240553	ph1240553@iitd.ac.in	Arjun Sarkar	Physics	Girnar	2	https://res.cloudinary.com/dt2rf9bfu/image/upload/v1772780657/profiles/47ce1c9c-009d-40ed-b255-c7df17b7c235.jpg	["Machine Learning", "Web Development", "AI"]	t	t	2026-03-06 05:36:11.857733
\.


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 7, true);


--
-- Name: calendar_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calendar_shares_id_seq', 4, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 49, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 158, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registrations_id_seq', 28, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: registrations _user_event_uc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT _user_event_uc UNIQUE (user_id, event_id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: calendar_shares calendar_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_shares
    ADD CONSTRAINT calendar_shares_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_name_key UNIQUE (name);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_user_id_org_id_role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_user_id_org_id_role_name_key UNIQUE (user_id, org_id, role_name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_api_keys_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_keys_id ON public.api_keys USING btree (id);


--
-- Name: ix_api_keys_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_keys_is_active ON public.api_keys USING btree (is_active);


--
-- Name: ix_api_keys_key_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_api_keys_key_hash ON public.api_keys USING btree (key_hash);


--
-- Name: ix_api_keys_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_keys_org_id ON public.api_keys USING btree (org_id);


--
-- Name: ix_calendar_shares_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_calendar_shares_id ON public.calendar_shares USING btree (id);


--
-- Name: ix_calendar_shares_share_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_calendar_shares_share_token ON public.calendar_shares USING btree (share_token);


--
-- Name: ix_events_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_events_id ON public.events USING btree (id);


--
-- Name: ix_events_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_events_name ON public.events USING btree (name);


--
-- Name: ix_events_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_events_org_id ON public.events USING btree (org_id);


--
-- Name: ix_registrations_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_registrations_id ON public.registrations USING btree (id);


--
-- Name: ix_roles_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_roles_org_id ON public.roles USING btree (org_id);


--
-- Name: ix_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_roles_user_id ON public.roles USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_entry_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_entry_number ON public.users USING btree (entry_number);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: api_keys api_keys_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: calendar_shares calendar_shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_shares
    ADD CONSTRAINT calendar_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: events fk_events_org_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_events_org_id FOREIGN KEY (org_id) REFERENCES public.organizations(id);


--
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: roles roles_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: roles roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Gjzwyg7OJ9DvFYbVRbfGzzpEhU2AOPUeJ0IHD1tGJNPHKjvo7iZ1psNdo33UThh

