const sql = `

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname='user_role'
    )
    THEN

        CREATE TYPE user_role AS ENUM(
            'Vendor',
            'User',
            'Expert',
            'Admin'
        );

    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_sequence'
    ) THEN
        ALTER TABLE crops_details
        ADD CONSTRAINT unique_sequence
        UNIQUE(sequence);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,

    role user_role DEFAULT 'User',

    profile_image TEXT,

    phone VARCHAR(15) UNIQUE NOT NULL,

    username VARCHAR(100) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_verify BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS otp_expire TIMESTAMP,
ADD COLUMN IF NOT EXISTS profile_image_id TEXT,
ADD COLUMN IF NOT EXISTS password TEXT;

CREATE TABLE IF NOT EXISTS crops(
    id SERIAL PRIMARY KEY,

    name VARCHAR(250) NOT NULL,

    decription TEXT,

    crop_theme_image TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE crops
ADD COLUMN IF NOT EXISTS crop_theme_image_id TEXT,
ADD COLUMN IF NOT EXISTS is_delete BOOLEAN DEFAULT false;



CREATE TABLE IF NOT EXISTS crops_details(
    id SERIAL PRIMARY KEY,

    crop_id INT NOT NULL,

    title VARCHAR(250),

    description TEXT,

    cropdetail_theme_image TEXT[],

    

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(crop_id)
    REFERENCES crops(id)
    ON DELETE CASCADE
);
ALTER TABLE crops_details
ADD COLUMN IF NOT EXISTS crop_details_theme_image_id TEXT[],
ADD COLUMN IF NOT EXISTS is_delete BOOLEAN DEFAULT false;
 
ALTER TABLE crops_details
ADD COLUMN IF NOT EXISTS sequence INT;

CREATE TABLE IF NOT EXISTS crops_question(
    id SERIAL PRIMARY KEY,

    crop_details_id INT NOT NULL,

    question TEXT NOT NULL,

    image_video TEXT[],

    description TEXT,

    user_id INT NOT NULL,

    question_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    expert_id INT,

    answer TEXT,

    answer_at TIMESTAMP,

    tag TEXT[],

    FOREIGN KEY(crop_details_id)
    REFERENCES crops_details(id)
    ON DELETE CASCADE,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY(expert_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);



CREATE TABLE IF NOT EXISTS crop_guide(
    id SERIAL PRIMARY KEY,

    crop_detail_id INT NOT NULL,

    crop_guides JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(crop_detail_id)
    REFERENCES crops_details(id)
    ON DELETE CASCADE
);

`;

export default sql;