import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';

/* ── Left sidebar categories (with images) ── */
const SIDEBAR = [
    { id: 'trending', label: 'Trending Now', accent: '#E8612C', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
    { id: 'hair', label: 'Hair Care', accent: '#8B5CF6', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
    { id: 'skin', label: 'Skin Care', accent: '#EC4899', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
    { id: 'nails', label: 'Nail Art', accent: '#10B981', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
    { id: 'makeup', label: 'Makeup', accent: '#F59E0B', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
    { id: 'tools', label: 'Pro Tools', accent: '#3B82F6', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
    { id: 'body', label: 'Body Care', accent: '#06B6D4', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
    { id: 'spa', label: 'Spa & Relax', accent: '#F97316', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
];

/* ── Right panel content per category (with real images for spotlight circles) ── */
const CONTENT = {
    trending: {
        spotlight: [
            { id: 1, label: "What's New", img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 2, label: 'Summer Sale', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 3, label: 'Bridal', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80' },
            { id: 4, label: 'New Arrivals', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 5, label: 'Hot Deals', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 6, label: 'Budget Finds', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 7, label: 'Top Rated', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 8, label: 'Gift Cards', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 9, label: 'Expert Picks', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'Rising Stars', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 2, label: 'Luxe', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'Pro Line', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
            { id: 4, label: 'Organic', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 5, label: 'Global', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, name: 'MAC', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, name: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 4, name: 'Maybelline', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 5, name: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
        ],
    },
    hair: {
        spotlight: [
            { id: 1, label: 'Shampoo', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, label: 'Conditioner', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, label: 'Hair Oil', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 4, label: 'Hair Mask', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 5, label: 'Serum', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 6, label: 'Color Care', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 7, label: 'Anti-Dandruff', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 8, label: 'Growth', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 9, label: 'Argan Oil', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, label: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, label: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 4, label: 'Pantene', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 5, label: 'Dove', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, name: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, name: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 4, name: 'Pantene', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 5, name: 'Dove', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
        ],
    },
    skin: {
        spotlight: [
            { id: 1, label: 'Face Wash', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, label: 'Moisturizer', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
            { id: 3, label: 'Sunscreen', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
            { id: 4, label: 'Serum', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, label: 'Face Mask', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 6, label: 'Toner', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80' },
            { id: 7, label: 'Eye Cream', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 8, label: 'Exfoliator', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 9, label: 'Vitamin C', img: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'DermaX', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, label: 'NatureSpa', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'GlowUp', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
            { id: 4, label: 'CeraVe', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 5, label: "Neutrogena", img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'DermaX', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, name: 'NatureSpa', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, name: 'CeraVe', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 4, name: 'La Roche', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
            { id: 5, name: 'Neutrogena', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
        ],
    },
    nails: {
        spotlight: [
            { id: 1, label: 'Nail Polish', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 2, label: 'Gel Nails', img: 'https://images.unsplash.com/photo-1604655845765-5d7c7a62c6f6?w=200&q=80' },
            { id: 3, label: 'Nail Art', img: 'https://images.unsplash.com/photo-1604655866854-8ebba0c3ca2e?w=200&q=80' },
            { id: 4, label: 'Nail Tools', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 5, label: 'Cuticle Oil', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 6, label: 'French Tips', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 7, label: 'Nail Remover', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 8, label: 'Nail Glitter', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 9, label: 'Press-Ons', img: 'https://images.unsplash.com/photo-1604655866854-8ebba0c3ca2e?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'OPI', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 2, label: 'Essie', img: 'https://images.unsplash.com/photo-1604655845765-5d7c7a62c6f6?w=200&q=80' },
            { id: 3, label: 'Sally', img: 'https://images.unsplash.com/photo-1604655866854-8ebba0c3ca2e?w=200&q=80' },
            { id: 4, label: 'Orly', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 5, label: 'Zoya', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'OPI', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 2, name: 'Essie', img: 'https://images.unsplash.com/photo-1604655845765-5d7c7a62c6f6?w=200&q=80' },
            { id: 3, name: 'Sally', img: 'https://images.unsplash.com/photo-1604655866854-8ebba0c3ca2e?w=200&q=80' },
            { id: 4, name: 'Orly', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 5, name: 'Zoya', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
        ],
    },
    makeup: {
        spotlight: [
            { id: 1, label: 'Foundation', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
            { id: 2, label: 'Lipstick', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 3, label: 'Eyeshadow', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 4, label: 'Mascara', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, label: 'Blush', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
            { id: 6, label: 'Bronzer', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 7, label: 'Highlighter', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 8, label: 'Primer', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 9, label: 'Concealer', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'MAC', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
            { id: 2, label: 'Maybelline', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 3, label: 'NYX', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 4, label: 'Lakme', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, label: 'Revlon', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'MAC', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
            { id: 2, name: 'Maybelline', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 3, name: 'NYX', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 4, name: 'Lakme', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, name: 'Revlon', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
        ],
    },
    tools: {
        spotlight: [
            { id: 1, label: 'Hair Dryer', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
            { id: 2, label: 'Straightener', img: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=200&q=80' },
            { id: 3, label: 'Curling Rod', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 4, label: 'Trimmer', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
            { id: 5, label: 'Scissors', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&q=80' },
            { id: 6, label: 'Brush Set', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 7, label: 'Comb & Pick', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 8, label: 'Roller Set', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 9, label: 'Diffuser', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'Philips', img: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=200&q=80' },
            { id: 2, label: 'Braun', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
            { id: 3, label: 'Dyson', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
            { id: 4, label: 'Panasonic', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 5, label: 'Vidal', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'Philips', img: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=200&q=80' },
            { id: 2, name: 'Braun', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
            { id: 3, name: 'Dyson', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
            { id: 4, name: 'Panasonic', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 5, name: 'Vidal', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&q=80' },
        ],
    },
    body: {
        spotlight: [
            { id: 1, label: 'Body Wash', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 2, label: 'Body Lotion', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 3, label: 'Scrub', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 4, label: 'Perfume', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 5, label: 'Deodorant', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 6, label: 'Body Oil', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 7, label: 'Foot Care', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
            { id: 8, label: 'Talc', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 9, label: 'Bath Salts', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'BodyShop', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 2, label: 'Dove', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 3, label: 'Vaseline', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 4, label: 'Nivea', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 5, label: 'Himalaya', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'BodyShop', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 2, name: 'Dove', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 3, name: 'Vaseline', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 4, name: 'Nivea', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 5, name: 'Himalaya', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
        ],
    },
    spa: {
        spotlight: [
            { id: 1, label: 'Essential Oils', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, label: 'Bath Bombs', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'Face Steam', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 4, label: 'Hot Stones', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 5, label: 'Mud Masks', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 6, label: 'Aromatherapy', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 7, label: 'Candles', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 8, label: 'Robe & Towels', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 9, label: 'Diffusers', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'Forest Essentials', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, label: 'Kama Ayurveda', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 3, label: 'Biotique', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 4, label: 'Vaadi', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, label: 'Soulflower', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'Forest', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, name: 'Kama', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
            { id: 3, name: 'Biotique', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 4, name: 'Vaadi', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, name: 'Soulflower', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
        ],
    },
};

/* gradients for 3D text cards — cycles through rich palette */
const CARD_GRADIENTS = [
    'linear-gradient(145deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
    'linear-gradient(145deg, #2D1B69 0%, #4A1A6B 60%, #7B2D8B 100%)',
    'linear-gradient(145deg, #0F2027 0%, #203A43 60%, #2C5364 100%)',
    'linear-gradient(145deg, #1A1A1A 0%, #3A0000 60%, #600000 100%)',
    'linear-gradient(145deg, #0A2342 0%, #126872 60%, #1B998B 100%)',
];

/* ── Auto-flipping 3D card for odd spotlight cells ── */
function FlipCard({ item, gradient, onClick, accent, delay }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        // Stagger the start so not all flip at once
        const initial = setTimeout(() => {
            setFlipped(true); // flip to image first
            const interval = setInterval(() => {
                setFlipped(prev => !prev); // toggle every 4s
            }, 4000);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(initial);
    }, [delay]);

    return (
        <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '7px', cursor: 'pointer',
            }}
        >
            {/* 3D flip container */}
            <div style={{
                width: '72px', height: '72px',
                perspective: '300px',
                flexShrink: 0,
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    borderRadius: '50%',
                }}>

                    {/* FRONT — 3D text card */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        background: gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '6px',
                        boxShadow: [
                            '0 1px 0 rgba(255,255,255,0.10) inset',
                            '0 -2px 0 rgba(0,0,0,0.3) inset',
                            '3px 5px 0 rgba(0,0,0,0.18)',
                            '2px 3px 10px rgba(0,0,0,0.22)',
                        ].join(', '),
                        overflow: 'hidden',
                    }}>
                        {/* shine */}
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: 'linear-gradient(155deg, rgba(255,255,255,0.2) 0%, transparent 55%)',
                            pointerEvents: 'none',
                        }} />
                        <span style={{
                            fontSize: '9.5px', fontWeight: 800,
                            color: '#fff',
                            textAlign: 'center', lineHeight: 1.25,
                            letterSpacing: '0.01em',
                            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                            fontFamily: "'Playfair Display', serif",
                            wordBreak: 'break-word',
                            zIndex: 1,
                            position: 'relative',
                        }}>
                            {item.label}
                        </span>
                    </div>

                    {/* BACK — circular photo */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        overflow: 'hidden',
                        border: '2px solid #2A2A2A',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                    }}>
                        <img
                            src={item.img} alt={item.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* label below */}
            <span style={{
                fontSize: '10px', fontWeight: 700,
                color: accent || '#C8956C',
                textAlign: 'center', lineHeight: 1.3,
            }}>
                {item.label}
            </span>
        </motion.div>
    );
}

/* ── Spotlight item — even = static photo, odd = auto-flipping card ── */
function SpotlightItem({ item, index, onClick, accent }) {
    const isImage = index % 2 === 0;
    const gradient = CARD_GRADIENTS[Math.floor(index / 2) % CARD_GRADIENTS.length];

    if (!isImage) {
        return (
            <FlipCard
                item={item}
                gradient={gradient}
                onClick={onClick}
                accent={accent}
                delay={index * 700}  // stagger: 700ms apart
            />
        );
    }

    return (
        <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer' }}
        >
            <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                overflow: 'hidden', flexShrink: 0,
                border: '2px solid #2A2A2A',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
            }}>
                <img
                    src={item.img} alt={item.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
            <span style={{
                fontSize: '10px', fontWeight: 500, color: '#A0A0A0',
                textAlign: 'center', lineHeight: 1.3,
            }}>
                {item.label}
            </span>
        </motion.div>
    );
}

/* ── Universe brand circular button (dark ring) ── */
function UniverseBtn({ item, onClick }) {
    return (
        <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '80px' }}
        >
            <div style={{
                width: '68px', height: '68px', borderRadius: '50%',
                overflow: 'hidden', flexShrink: 0,
                border: '2.5px solid #E0E0E0',
                boxShadow: '0 2px 10px rgba(255,255,255,0.08)',
            }}>
                <img
                    src={item.img} alt={item.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
            <span style={{
                fontSize: '10px', fontWeight: 600, color: '#FFFFFF',
                textAlign: 'center', lineHeight: 1.3,
            }}>
                {item.label}
            </span>
        </motion.div>
    );
}

export default function AppProductCategoriesPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState('trending');

    const cat = SIDEBAR.find(s => s.id === active);
    const content = CONTENT[active] || CONTENT.trending;

    return (
        <div style={{
            background: '#141414', minHeight: '100svh',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            color: '#FFFFFF',
        }}>

            {/* ── TOP HEADER ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '52px 16px 14px',
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #2A2A2A',
                position: 'sticky', top: 0, zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                        <ArrowLeft size={22} color="#FFFFFF" />
                    </motion.button>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF' }}>Categories</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <motion.button whileTap={{ scale: 0.9 }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Heart size={22} color="#FFFFFF" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/app/shop')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ShoppingBag size={22} color="#FFFFFF" />
                    </motion.button>
                </div>
            </div>

            {/* ── BODY: SIDEBAR + CONTENT ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT SIDEBAR */}
                <div style={{
                    width: '88px', flexShrink: 0,
                    background: '#1A1A1A',
                    overflowY: 'auto',
                    borderRight: '1px solid #2A2A2A',
                }}>
                    {SIDEBAR.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <motion.div
                                key={item.id}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setActive(item.id)}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    padding: '14px 8px',
                                    cursor: 'pointer',
                                    background: isActive ? '#141414' : 'transparent',
                                    borderLeft: isActive ? `3px solid ${item.accent}` : '3px solid transparent',
                                    transition: 'all 0.18s',
                                    gap: '8px',
                                }}
                            >
                                {/* Category Image */}
                                <div style={{
                                    width: '54px', height: '54px', borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: isActive ? `2px solid ${item.accent}` : '2px solid #333',
                                    boxShadow: isActive ? `0 4px 12px ${item.accent}44` : '0 1px 4px rgba(0,0,0,0.3)',
                                    transition: 'all 0.18s',
                                }}>
                                    <img
                                        src={item.img} alt={item.label}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                </div>
                                <span style={{
                                    fontSize: '9.5px',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? item.accent : '#999',
                                    textAlign: 'center', lineHeight: 1.3,
                                    transition: 'all 0.18s',
                                }}>
                                    {item.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* RIGHT CONTENT PANEL */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#141414', paddingBottom: '32px' }}>

                    {/* Active category hero strip with image */}
                    <div style={{ position: 'relative', height: '80px', overflow: 'hidden' }}>
                        <img
                            src={cat.img} alt={cat.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 100%)',
                            display: 'flex', alignItems: 'center', padding: '0 16px',
                        }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>
                                {cat.label}
                            </span>
                        </div>
                    </div>

                    {/* ── IN THE SPOTLIGHT ── */}
                    <div style={{ padding: '18px 12px 0' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px', paddingLeft: '4px' }}>
                            In The Spotlight
                        </h3>
                        <motion.div
                            key={active + '-spotlight'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '18px 6px',
                            }}
                        >
                            {content.spotlight.map((item, i) => (
                                <SpotlightItem
                                    key={item.id}
                                    item={item}
                                    index={i}
                                    accent={cat.accent}
                                    onClick={() => navigate(`/app/shop?tag=${encodeURIComponent(item.label)}`)}
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── SALON UNIVERSE ── */}
                    <div style={{ padding: '24px 12px 0' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px', paddingLeft: '4px' }}>
                            Salon Universe
                        </h3>
                        <motion.div
                            key={active + '-universe'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28, delay: 0.06 }}
                            style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
                        >
                            {content.universe.map((item) => (
                                <UniverseBtn
                                    key={item.id}
                                    item={item}
                                    onClick={() => navigate('/app/shop')}
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── TRENDING BRANDS ── */}
                    <div style={{ padding: '24px 12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingLeft: '4px', paddingRight: '4px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                                Trending Brands
                            </h3>
                            <button
                                onClick={() => navigate('/app/shop')}
                                style={{ fontSize: '12px', color: '#C8956C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                See All
                            </button>
                        </div>
                        <motion.div
                            key={active + '-stores'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28, delay: 0.1 }}
                            style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', paddingLeft: '4px' }}
                        >
                            {content.trending_stores.map((store) => (
                                <motion.div
                                    key={store.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/app/shop')}
                                    style={{ flexShrink: 0, cursor: 'pointer', textAlign: 'center' }}
                                >
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid #2A2A2A',
                                        marginBottom: '6px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    }}>
                                        <img
                                            src={store.img} alt={store.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '10px', fontWeight: 500, color: '#A0A0A0', display: 'block' }}>
                                        {store.name}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── VIEW ALL CTA ── */}
                    <div style={{ padding: '24px 16px 0' }}>
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/app/shop?category=${encodeURIComponent(cat.label)}`)}
                            style={{
                                borderRadius: '14px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                                height: '80px',
                            }}
                        >
                            <img
                                src={cat.img} alt={cat.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.48)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0 18px',
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                                    View All {cat.label}
                                </span>
                                <div style={{
                                    background: '#C8956C', borderRadius: '8px',
                                    padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#fff',
                                }}>
                                    Shop Now
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
