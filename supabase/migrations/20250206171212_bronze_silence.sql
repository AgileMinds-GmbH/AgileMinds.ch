-- Add Early Bird pricing columns
ALTER TABLE courses
ADD COLUMN early_bird_price decimal(10,2),
ADD COLUMN early_bird_deadline date;

-- Add check constraint to ensure early bird price is less than regular price
ALTER TABLE courses
ADD CONSTRAINT early_bird_price_check 
CHECK (early_bird_price IS NULL OR early_bird_price < price);

-- Add check constraint to ensure early bird deadline is before start date
ALTER TABLE courses
ADD CONSTRAINT early_bird_deadline_check 
CHECK (early_bird_deadline IS NULL OR early_bird_deadline < start_date);