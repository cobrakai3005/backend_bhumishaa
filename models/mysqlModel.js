const sql = `

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    role ENUM('Farmer', 'Expert', 'Admin', 'Vendor', 'Customer') DEFAULT 'Farmer',

    profile_image TEXT,

    phone VARCHAR(15) UNIQUE NOT NULL,

    username VARCHAR(100) UNIQUE NOT NULL,

    otp VARCHAR(6),

    otp_verify BOOLEAN DEFAULT FALSE,

    otp_expire TIMESTAMP NULL,

    profile_image_id TEXT,

    password TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
);



-- CROPS TABLE
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(250) NOT NULL,

    description TEXT,

    crop_theme_image TEXT,

    crop_theme_image_id TEXT,

    is_delete BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
);


       -- ALTER TABLE crops
       -- ADD COLUMN category_id INT,
       -- ADD CONSTRAINT fk_crops_category
       -- FOREIGN KEY (category_id)
       -- REFERENCES categories(id)
       -- ON DELETE SET NULL
       -- ON UPDATE CASCADE;

       -- ALTER TABLE crops
       -- ADD COLUMN nameHi VARCHAR(255) NOT NULL AFTER name;

      



-- CROPS DETAILS TABLE
CREATE TABLE IF NOT EXISTS crops_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    crop_id INT NOT NULL,

    title VARCHAR(250),
    titleHi VARCHAR(250),

    description TEXT,
    descriptionHi TEXT,
    cropdetail_theme_image JSON,

    crop_details_theme_image_id JSON,

    is_delete BOOLEAN DEFAULT FALSE,

    sequence INT UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_crop_details_crop
        FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
);

        



-- CROPS QUESTION TABLE
CREATE TABLE IF NOT EXISTS crops_question (
    id INT AUTO_INCREMENT PRIMARY KEY,

    crop_details_id INT NOT NULL,

    question TEXT NOT NULL,

    image_video JSON,

    description TEXT,

    user_id INT NOT NULL,

    question_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    expert_id INT,

    answer TEXT,

    answer_at TIMESTAMP NULL,

    tag JSON,

    CONSTRAINT fk_question_crop_detail
        FOREIGN KEY (crop_details_id)
        REFERENCES crops_details(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_question_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_question_expert
        FOREIGN KEY (expert_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);



-- CROP GUIDE TABLE
CREATE TABLE IF NOT EXISTS crop_guide (
    id INT AUTO_INCREMENT PRIMARY KEY,

    crop_detail_id INT NOT NULL,

    crop_guides JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_crop_guide_detail
        FOREIGN KEY (crop_detail_id)
        REFERENCES crops_details(id)
        ON DELETE CASCADE
);




create table IF NOT EXISTS crop_guide_heading (
    id int auto_increment primary key,
    title varchar (255),
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP
);

create table IF NOT EXISTS crop_guide_parent(
     id int auto_increment primary key,
    crop_guide_heading_id int ,

    crop_id int,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,


 CONSTRAINT fk_question_crop_guide_heading
        FOREIGN KEY (crop_guide_heading_id)
        REFERENCES crop_guide_heading(id)
        ON DELETE CASCADE,
 CONSTRAINT fk_question_crop
        FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS crop_guide_details (
    id INT PRIMARY KEY AUTO_INCREMENT,

    title VARCHAR(255),
    description TEXT,
    media_url VARCHAR(500),

    crop_guide_parent_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_guide_parent_id)
        REFERENCES crop_guide_parent(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nameHi VARCHAR(255) NOT NULL,
   
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


`;

export default sql;

/**
 * 
 * 
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nameHi VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    location VARCHAR(500),
    documents JSON,
    rating DECIMAL(3,2) DEFAULT 0,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vendor_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendor_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_profile_id INT NOT NULL,
    category_id INT NOT NULL,
    UNIQUE KEY unique_vendor_category (vendor_profile_id, category_id),
    CONSTRAINT fk_vc_vendor FOREIGN KEY (vendor_profile_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_vc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INT DEFAULT 0,
    images JSON,
    image_ids JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    commission_type ENUM('fixed', 'percentage') NOT NULL,
    commission_value DECIMAL(12,2) NOT NULL,
    set_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_commission_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_commission_admin FOREIGN KEY (set_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    customer_id INT NOT NULL,
    vendor_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_address TEXT,
    status ENUM('placed', 'dispatched', 'delivered', 'cancelled') DEFAULT 'placed',
    question_id INT,
    suggestion_id INT,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expert_suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    crop_id INT,
    expert_id INT NOT NULL,
    suggestion_text TEXT NOT NULL,
    pesticide_name VARCHAR(255),
    product_ids JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_suggestion_question FOREIGN KEY (question_id) REFERENCES crops_question(id) ON DELETE SET NULL,
    CONSTRAINT fk_suggestion_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
    CONSTRAINT fk_suggestion_expert FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    category_id INT NOT NULL,
    enquiry_type ENUM('product', 'service', 'solution', 'requirement') NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    status ENUM('open', 'sent', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enquiry_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enquiry_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enquiry_id INT NOT NULL,
    farmer_id INT NOT NULL,
    vendor_id INT NOT NULL,
    status ENUM('sent', 'responded', 'admin_connected', 'nurturing', 'closed') DEFAULT 'sent',
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lead_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
    CONSTRAINT fk_lead_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lead_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vendor_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    vendor_id INT NOT NULL,
    message TEXT,
    quotation JSON,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_response_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    admin_id INT NOT NULL,
    action_type ENUM('connect', 'follow_up', 'note', 'close') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel ENUM('email', 'sms', 'in_app') NOT NULL,
    title VARCHAR(255),
    message TEXT,
    reference_type VARCHAR(50),
    reference_id INT,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 */
