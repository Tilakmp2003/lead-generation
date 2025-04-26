-- Function to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Required to access auth.users table
AS $$
BEGIN
  -- Insert a new row into public.profiles
  INSERT INTO public.profiles (id, name, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name', -- Get name from metadata if available
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();