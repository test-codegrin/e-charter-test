-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 30, 2025 at 08:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `echarter`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `adminName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `adminName`, `email`, `password`) VALUES
(1, 'test', 'asdf@gmail.com', '$2b$10$DwS03yBcBo9SgQsljAr7QeyGRl2Vcf/8Pvgi90qwFgMR1iIb8mjuW');

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `car_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `carName` varchar(255) NOT NULL,
  `carNumber` varchar(11) NOT NULL,
  `carSize` varchar(255) NOT NULL,
  `carType` varchar(255) NOT NULL,
  `status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`car_id`, `driver_id`, `carName`, `carNumber`, `carSize`, `carType`, `status`) VALUES
(1, 2, 'Honda City', '0', 'Medium', 'Sedan', 0),
(2, 2, 'Honda City', 'GJ01AB1234', 'Medium', 'Sedan', 1);

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `driverName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `cityName` varchar(255) NOT NULL,
  `status` tinyint(4) DEFAULT 2,
  `zipCode` int(11) NOT NULL,
  `phoneNo` int(22) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `driverName`, `email`, `password`, `address`, `cityName`, `status`, `zipCode`, `phoneNo`) VALUES
(1, 'test', 'asdf@gmail.com', '$2b$10$pgpv55CdLIOVNYdkrm16.eroMVsyyIzMVzpAwczh0ZnrHYcoN5HTS', 'testsdvdsa', 'asdf', 1, 2342, 2345),
(2, 'test', 'test@gmail.com', '$2b$10$NSn0lBjntt8C9AUOKJr.zeII09WkI16ZkZMh55DjfNj1AXOZkdxr6', 'testsdvdsa', 'test', 1, 2342, 2345);

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `trip_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) DEFAULT NULL,
  `pickupLocation` varchar(255) NOT NULL,
  `pickupLatitude` decimal(10,8) DEFAULT NULL,
  `pickupLongitude` decimal(11,8) DEFAULT NULL,
  `dropLocation` varchar(255) NOT NULL,
  `dropLatitude` decimal(10,8) DEFAULT NULL,
  `dropLongitude` decimal(11,8) DEFAULT NULL,
  `tripStartDate` date NOT NULL,
  `tripEndDate` date DEFAULT NULL,
  `tripTime` time NOT NULL,
  `durationHours` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `distance_km` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`trip_id`, `user_id`, `car_id`, `pickupLocation`, `pickupLatitude`, `pickupLongitude`, `dropLocation`, `dropLatitude`, `dropLongitude`, `tripStartDate`, `tripEndDate`, `tripTime`, `durationHours`, `status`, `created_at`, `distance_km`) VALUES
(11, 4, NULL, 'Rajkot', 22.30390000, 70.80220000, 'Ahmedabad', 23.02250000, 72.57140000, '2025-07-01', '2025-07-03', '10:30:00', 6, '0', '2025-06-26 13:26:39', 240.97),
(12, 4, NULL, 'Rajkot', 22.30390000, 70.80220000, 'Ahmedabad', 23.02250000, 72.57140000, '2025-07-01', '2025-07-02', '08:30:00', 10, '0', '2025-06-30 05:05:23', 240.97);

-- --------------------------------------------------------

--
-- Table structure for table `trip_midstops`
--

CREATE TABLE `trip_midstops` (
  `midstops_id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `stopName` varchar(255) NOT NULL,
  `stopOrder` int(11) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `stayDuration` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_midstops`
--

INSERT INTO `trip_midstops` (`midstops_id`, `trip_id`, `stopName`, `stopOrder`, `latitude`, `longitude`, `created_at`, `stayDuration`) VALUES
(5, 11, 'Morbi', 1, 22.81730000, 70.83770000, '2025-06-26 13:26:39', 0),
(6, 11, 'Surendranagar', 2, 22.72710000, 71.63700000, '2025-06-26 13:26:39', 0),
(7, 12, 'Morbi', 1, 22.81730000, 70.83770000, '2025-06-30 05:05:23', 2),
(8, 12, 'Surendranagar', 2, 22.72710000, 71.63700000, '2025-06-30 05:05:23', 1.5);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `cityName` varchar(255) NOT NULL,
  `zipCode` int(22) NOT NULL,
  `phoneNo` int(22) NOT NULL,
  `profileImage` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `firstName`, `lastName`, `email`, `password`, `address`, `cityName`, `zipCode`, `phoneNo`, `profileImage`) VALUES
(4, 'John ', 'asd', 'asdf@gmail.com', '$2b$10$/wjflftH7UjS17xPNcbfm.ULnHRGUde0qKRDhmqOgxr2FfFPAUCIG', '123 Main Street', 'Mumbai', 400001, 2147483647, 'https://ik.imagekit.io/krina/echarter/user-profile/John__profile_1750833066409_pzWRczDJG.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`car_id`),
  ADD KEY `fk_driver_car` (`driver_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `trip_midstops`
--
ALTER TABLE `trip_midstops`
  ADD PRIMARY KEY (`midstops_id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `car`
--
ALTER TABLE `car`
  MODIFY `car_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `trip_midstops`
--
ALTER TABLE `trip_midstops`
  MODIFY `midstops_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car`
--
ALTER TABLE `car`
  ADD CONSTRAINT `fk_driver_car` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `car` (`car_id`);

--
-- Constraints for table `trip_midstops`
--
ALTER TABLE `trip_midstops`
  ADD CONSTRAINT `trip_midstops_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
