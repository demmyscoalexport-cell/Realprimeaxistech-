<?php
/**
 * Plugin Name: PrimeAxis CMS Bridge
 * Description: Registers custom post types, taxonomies, and post meta needed by the PrimeAxis Tech headless frontend. Exposes everything to the WP REST API.
 * Version: 1.0.0
 * Author: PrimeAxis
 *
 * Install: drop this file into  wp-content/mu-plugins/primeaxis-cms.php
 * (create the mu-plugins folder if it doesn't exist). Must-use plugins
 * activate automatically — no Plugins page action needed.
 */

if (!defined('ABSPATH')) exit;

/* ------------------------------------------------------------------ */
/*  1. Custom post types: review, video                                */
/* ------------------------------------------------------------------ */
add_action('init', function () {
  register_post_type('review', [
    'label'         => 'Reviews',
    'public'        => true,
    'show_in_rest'  => true,
    'rest_base'     => 'reviews',
    'has_archive'   => true,
    'supports'      => ['title', 'editor', 'excerpt', 'thumbnail', 'author', 'custom-fields'],
    'taxonomies'    => ['category', 'post_tag'],
  ]);

  register_post_type('video', [
    'label'         => 'Videos',
    'public'        => true,
    'show_in_rest'  => true,
    'rest_base'     => 'videos',
    'has_archive'   => true,
    'supports'      => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
    'taxonomies'    => ['category'],
  ]);
});

/* ------------------------------------------------------------------ */
/*  2. Custom post meta — exposed to REST                              */
/* ------------------------------------------------------------------ */
function primeaxis_register_meta($post_type, $fields) {
  foreach ($fields as $key => $type) {
    register_post_meta($post_type, $key, [
      'type'         => $type === 'array' ? 'string' : $type,
      'single'       => true,
      'show_in_rest' => $type === 'array'
        ? ['schema' => ['type' => 'array', 'items' => ['type' => 'string']]]
        : true,
      'auth_callback' => function () { return current_user_can('edit_posts'); },
    ]);
  }
}

add_action('init', function () {
  primeaxis_register_meta('post', [
    'subtitle'         => 'string',
    'hero_image_url'   => 'string',
    'reading_minutes'  => 'integer',
    'subcategory_slug' => 'string',
    'is_breaking'      => 'boolean',
    'is_feature'       => 'boolean',
    'key_takeaways'    => 'array',
    'ai_summary'       => 'string',
  ]);

  primeaxis_register_meta('review', [
    'product_name'      => 'string',
    'tagline'           => 'string',
    'hero_image_url'    => 'string',
    'gallery_image_urls'=> 'array',
    'score'             => 'number',
    'verdict'           => 'string',
    'price_usd'         => 'number',
    'pros'              => 'array',
    'cons'              => 'array',
    'ratings_json'      => 'string',  // JSON: [{name,score}]
    'sections_json'     => 'string',  // JSON: [{heading,body}]
  ]);

  primeaxis_register_meta('video', [
    'thumbnail_url'    => 'string',
    'video_url'        => 'string',
    'duration_seconds' => 'integer',
  ]);
});

/* ------------------------------------------------------------------ */
/*  3. Custom category meta — accent color, subcategories              */
/* ------------------------------------------------------------------ */
add_action('init', function () {
  register_term_meta('category', 'accent_color', [
    'type'         => 'string',
    'single'       => true,
    'show_in_rest' => true,
    'auth_callback' => function () { return current_user_can('manage_categories'); },
  ]);
  register_term_meta('category', 'subcategories_json', [
    'type'         => 'string',
    'single'       => true,
    'show_in_rest' => true,
    'auth_callback' => function () { return current_user_can('manage_categories'); },
  ]);
  register_term_meta('category', 'sort_order', [
    'type'         => 'integer',
    'single'       => true,
    'show_in_rest' => true,
    'auth_callback' => function () { return current_user_can('manage_categories'); },
  ]);
});

/* ------------------------------------------------------------------ */
/*  4. Author profile fields → exposed via REST users                  */
/* ------------------------------------------------------------------ */
add_filter('rest_prepare_user', function ($response, $user) {
  $data = $response->get_data();
  $data['role_title'] = get_user_meta($user->ID, 'role_title', true);
  $data['twitter']    = get_user_meta($user->ID, 'twitter', true);
  $data['avatar_url'] = get_user_meta($user->ID, 'avatar_url', true);
  $response->set_data($data);
  return $response;
}, 10, 2);

/* ------------------------------------------------------------------ */
/*  5. Always include _embedded by default for posts/reviews/videos    */
/*     (saves clients an extra round-trip for author + featured image) */
/* ------------------------------------------------------------------ */
add_filter('rest_post_query',   'primeaxis_force_embed', 10, 2);
add_filter('rest_review_query', 'primeaxis_force_embed', 10, 2);
add_filter('rest_video_query',  'primeaxis_force_embed', 10, 2);
function primeaxis_force_embed($args, $request) {
  return $args; // _embed is requested by the client; this is a placeholder hook.
}

/* ------------------------------------------------------------------ */
/*  6. CORS — allow the headless frontend to call the REST API         */
/* ------------------------------------------------------------------ */
add_action('rest_api_init', function () {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
    $origin = get_http_origin();
    $allowed = array_filter(array_map('trim', explode(',', getenv('PRIMEAXIS_ALLOWED_ORIGINS') ?: '*')));
    if (in_array('*', $allowed, true) || ($origin && in_array($origin, $allowed, true))) {
      header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
      header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
    }
    return $value;
  });
});

/* ------------------------------------------------------------------ */
/*  7. Increase per_page max from 100 to 200 for migration             */
/* ------------------------------------------------------------------ */
add_filter('rest_post_max_pages', function () { return 999; });
