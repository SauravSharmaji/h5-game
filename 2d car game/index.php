<?php
/*
Plugin Name: Movie Review Publisher
Description: Fetch detailed movie reviews, images, and metadata from TMDB using a movie ID.
Version: 1.4
Author: Your Name
*/

// Define API Key for TMDB
define('TMDB_API_KEY_MOVIE', '6abe0b621cf82454f8b903ece0908e69'); // Replace with your TMDB API Key


$movie_site_name = "Bollyflix Movie"; // Use unique variable for site name

// Add admin menu
add_action('admin_menu', 'tmdb_movie_review_menu');
function tmdb_movie_review_menu() {
    add_menu_page('Movie Review Publisher', 'Movie Publisher', 'manage_options', 'tmdb-movie-review', 'tmdb_movie_review_page');
}


// Admin page for entering TMDB movie ID with checkboxes for category selection
function tmdb_movie_review_page() {
    global $movie_site_name;
    ?>
    <div class="wrap">
        <h1>TMDB Movie Review Publisher</h1>
        <form method="post" action="">
            <label for="movie_id">Enter TMDB Movie ID:</label>
            <input type="text" name="movie_id" id="movie_id" required>
<hr>
            <label for="category">Select Categories:</label>
            <div class="category-checkboxes">
                <?php
                // Define default selected category slugs
                $default_categories = ['hollywood-movie', 'hindi-dubbed','action-movie','bollywood-movie','comedy-movie','latest-release','uncategorized','review','south-movie','thriller-movies']; // Set default category slugs here

                // Fetch all categories
                $categories = get_categories(['hide_empty' => false]);

                if (!empty($categories)) {
                    foreach ($categories as $category) {
                        // Check if category is in the default selected categories array
                        $checked = in_array($category->slug, $default_categories) ? 'checked' : '';
                        echo "<label><input type='checkbox' name='category_ids[]' value='{$category->term_id}' {$checked}> {$category->name}</label><br>";
                    }
                } else {
                    echo "<p>No categories available</p>";
                }
                ?>
            </div>
            
            <button type="submit" class="button button-primary">Fetch and Publish Movie</button>
        </form>
    </div>
    
     <style>
        /* Style for the multi-select checkboxes */
        .category-checkboxes {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ccc;
            background: #f9f9f9;
            border-radius: 5px;
            /*max-height: 200px;*/
            overflow-y: auto;
        }
        .checkbox-item {
            margin-bottom: 5px;
        }
        .checkbox-item label {
            cursor: pointer;
        }
        .checkbox-item input[type="checkbox"] {
            margin-right: 5px;
        }
    </style>
    <?php

    // Handle form submission to fetch movie data and publish
    if (isset($_POST['movie_id']) && isset($_POST['category_ids']) && is_array($_POST['category_ids'])) {
        $movie_id = sanitize_text_field($_POST['movie_id']);
        $category_ids = array_map('intval', $_POST['category_ids']); // Sanitize and map category IDs
        
        tmdb_fetch_and_publish_movie($movie_id, $category_ids);
        echo '<p>Movie with TMDB ID ' . esc_html($movie_id) . ' has been published!</p>';
    }
}

// Fetch and publish movie data
function tmdb_fetch_and_publish_movie($movie_id, $category_ids) {
    $movie_data = tmdb_fetch_movie_data($movie_id);
    $images = tmdb_fetch_movie_images($movie_id);
    $reviews = tmdb_fetch_movie_reviews($movie_id);
    $cast = tmdb_fetch_movie_cast($movie_id);

    if ($movie_data) {
        tmdb_insert_movie_post($movie_data, $images, $reviews, $cast, $category_ids);
    } else {
        echo '<p>Failed to fetch movie data. Please check the movie ID.</p>';
    }
}

// Fetch movie data from TMDB API
function tmdb_fetch_movie_data($movie_id) {
    $response = wp_remote_get("https://api.themoviedb.org/3/movie/{$movie_id}?api_key=" . TMDB_API_KEY_MOVIE);
    if (is_wp_error($response)) {
        return null;
    }
    return json_decode(wp_remote_retrieve_body($response), true);
}

// Fetch movie images from TMDB API
function tmdb_fetch_movie_images($movie_id) {
    $response = wp_remote_get("https://api.themoviedb.org/3/movie/{$movie_id}/images?api_key=" . TMDB_API_KEY_MOVIE);
    if (is_wp_error($response)) {
        return [];
    }
    $images_data = json_decode(wp_remote_retrieve_body($response), true);
    return $images_data['backdrops'] ?? [];
}

// Fetch movie reviews from TMDB API
function tmdb_fetch_movie_reviews($movie_id) {
    $response = wp_remote_get("https://api.themoviedb.org/3/movie/{$movie_id}/reviews?api_key=" . TMDB_API_KEY_MOVIE);
    if (is_wp_error($response)) {
        return [];
    }
    $reviews_data = json_decode(wp_remote_retrieve_body($response), true);
    return $reviews_data['results'] ?? [];
}

// Fetch movie cast from TMDB API
function tmdb_fetch_movie_cast($movie_id) {
    $response = wp_remote_get("https://api.themoviedb.org/3/movie/{$movie_id}/credits?api_key=" . TMDB_API_KEY_MOVIE);
    if (is_wp_error($response)) {
        return [];
    }
    $cast_data = json_decode(wp_remote_retrieve_body($response), true);
    return $cast_data['cast'] ?? [];
}

// Insert movie post with category and additional details
function tmdb_insert_movie_post($movie_data, $images, $reviews, $cast, $category_ids) {
    global $movie_site_name;
    $title = $movie_data['title'] ?? 'Untitled Movie';
    $overview = $movie_data['overview'] ?? 'No overview available.';
    $release_date = $movie_data['release_date'] ?? 'N/A';
    $runtime = $movie_data['runtime'] ?? 'N/A';
    $status = $movie_data['status'] ?? 'N/A';
    $original_language = $movie_data['original_language'] ?? 'N/A';
    $budget = isset($movie_data['budget']) ? number_format($movie_data['budget']) : 'N/A';
    $revenue = isset($movie_data['revenue']) ? number_format($movie_data['revenue']) : 'N/A';
    $genres = implode(', ', array_column($movie_data['genres'] ?? [], 'name'));
    $tagline = $movie_data['tagline'] ?? 'N/A';
     $rating = $movie_data['vote_average'] ?? 'N/A';

    $post_content = "<h2>{$movie_site_name} {$title} Overview</h2><p><a href='https://bollyflix.support/'>Bollyflix</a> {$title} {$overview}</p>";
    $post_content .= "<h3>{$title} {$movie_site_name} Details</h3>";
    $post_content .= "<table>";
    $post_content .= "<tr><th>Detail</th><th>Information</th></tr>";
    $post_content .= "<tr><td>Release Date</td><td> <a href='https://bollyflix.support/'>Bollyflix</a>  {$release_date}</td></tr>";
    $post_content .= "<tr><td>Runtime</td><td>{$runtime} minutes</td></tr>";
    $post_content .= "<tr><td>Status</td><td>{$status}</td></tr>";
    $post_content .= "<tr><td>Original Language</td><td>{$original_language}</td></tr>";
    $post_content .= "<tr><td>Budget</td><td>{$budget}</td></tr>";
    $post_content .= "<tr><td>Revenue</td><td>{$revenue}</td></tr>";
    $post_content .= "<tr><td>Genres</td><td>{$genres}</td></tr>";
    $post_content .= "<tr><td>Tagline</td><td>{$tagline}</td></tr>";
        $post_content .= "<tr><td>rating</td><td class='yellow-text'>{$rating} out of 10</td></tr>";

    $post_content .= "</table>";

    // Display top 5 cast members
    if (!empty($cast)) {
        $post_content .= "<h3>{$movie_site_name} {$title} Cast</h3>";
        $post_content .= "[adsense_ad] <table><tr><th> <a href='https://bollyflix.support/'>Bollyflix</a> Name</th><th>Character</th></tr>";
        $top_cast = array_slice($cast, 0, 10);
        foreach ($top_cast as $member) {
            $post_content .= "<tr><td>{$member['name']}</td><td>{$member['character']}</td></tr>";
        }
        $post_content .= "</table>";
    } else {
        $post_content .= "<p>No cast information available.</p>";
    }

    // Limit to 5 images
    if (!empty($images)) {
        $post_content .= "<h3>{$title} Images {$movie_site_name}</h3>";
        $post_content .= "[adsense_ad] <p><strong>Image Credits:</strong> All images are sourced from TMDB.</p>";
        $limited_images = array_slice($images, 0, 5);
        foreach ($limited_images as $image) {
            $image_url = 'https://image.tmdb.org/t/p/w500' . $image['file_path'];
            $attachment_id = tmdb_save_image_to_media_library($image_url);
            if ($attachment_id) {
                $image_src = wp_get_attachment_url($attachment_id);
                $post_content .= "<img src='{$image_src}' alt='Movie Image' />";
            }
        }
    } else {
        $post_content .= "<p>No images available.</p>";
    }
    if (!empty($cast)) {
    $post_content .= "<h3>{$title} Cast {$movie_site_name}</h3>";
    $top_cast = array_slice($cast, 0, 10);
    $cast_list = [];
    foreach ($top_cast as $member) {
        $cast_list[] = "{$member['name']} as {$member['character']}";
    }
    $post_content .= "[adsense_ad] <p><a href='https://bollyflix.support/'>Bollyflix</a> " . implode(', ', $cast_list) . ".</p>";
} else {
    $post_content .= "<p>No cast information available.</p>";
}


    // Limit reviews to 1000 characters
    if (!empty($reviews)) {
        $post_content .= "<h3>{$title} {$movie_site_name} Reviews</h3>";
        $limited_reviews = '';
        $character_count = 0;
        foreach ($reviews as $review) {
            $review_content = wp_trim_words($review['content'], 100, '...');
            $character_count += strlen($review_content);
            if ($character_count <= 2000) {
                $limited_reviews .= "[adsense_ad] <p>{$review_content}</p>";
            } else {
                break;
            }
        }
        $post_content .= $limited_reviews;
    } else {
        $post_content .= "<p>No reviews available.</p>";
    }

    // Insert the post
$post = [
    'post_title' => $title . ' ' . $movie_site_name, // Corrected concatenation
    'post_content' => $post_content,
    'post_status' => 'publish',
    'post_author' => 1, // Use an admin user ID
    'tags_input' => [$title, $movie_site_name], // No concatenation needed here, separate tags
    'post_category' => $category_ids, // Pass the selected categories
];


    $post_id = wp_insert_post($post);

    // Set featured image
    if (isset($movie_data['poster_path'])) {
        $poster_url = 'https://image.tmdb.org/t/p/w500' . $movie_data['poster_path'];
        $attachment_id = tmdb_save_image_to_media_library($poster_url);
        if ($attachment_id) {
            set_post_thumbnail($post_id, $attachment_id);
        }
    }
}

// Save image to media library
function tmdb_save_image_to_media_library($image_url) {
    $image_name = basename($image_url);
    $upload_dir = wp_upload_dir();
    $image_data = file_get_contents($image_url);

    if ($image_data) {
        $file_path = $upload_dir['path'] . '/' . $image_name;
        file_put_contents($file_path, $image_data);

        // Insert the image into the WordPress media library
        $attachment = [
            'post_mime_type' => mime_content_type($file_path),
            'post_title' => sanitize_file_name($image_name),
            'post_content' => '',
            'post_status' => 'inherit',
        ];
        $attachment_id = wp_insert_attachment($attachment, $file_path);
        return $attachment_id;
    }

    return false;
}
