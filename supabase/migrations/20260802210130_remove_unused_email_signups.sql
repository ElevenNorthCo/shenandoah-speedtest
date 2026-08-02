-- The application no longer writes to this legacy table. It contains no rows,
-- and keeping an exposed, policy-free PII table creates needless attack surface.
drop table if exists public.email_signups;
